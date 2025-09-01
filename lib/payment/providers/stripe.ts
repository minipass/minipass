import Stripe from 'stripe'

import { stripe } from '@/lib/stripe'

import { AccountStatus, CheckoutSession, PaymentProvider } from '../../../convex/types'
import { PaymentProviderBase } from './base'

export class StripeProvider extends PaymentProviderBase {
    provider: PaymentProvider = 'stripe'
    private stripe: Stripe

    constructor() {
        super()
        this.stripe = stripe
    }

    async createAccount() {
        const account = await this.stripe.accounts.create({
            type: 'express',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        })
        return { accountId: account.id, walletId: null }
    }

    async getAccountStatus(accountId: string): Promise<AccountStatus> {
        const account = await this.stripe.accounts.retrieve(accountId)

        return {
            isActive: account.details_submitted && !account.requirements?.currently_due?.length,
            requiresInformation: !!(
                account.requirements?.currently_due?.length ||
                account.requirements?.eventually_due?.length ||
                account.requirements?.past_due?.length
            ),
            requirements: {
                currently_due: account.requirements?.currently_due || [],
                eventually_due: account.requirements?.eventually_due || [],
                past_due: account.requirements?.past_due || [],
            },
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
        }
    }

    async createAccountLink(accountId: string): Promise<{ url: string }> {
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/refresh/${accountId}`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/return/${accountId}`,
            type: 'account_onboarding',
        })
        return { url: accountLink.url }
    }

    async createLoginLink(accountId: string): Promise<string> {
        const loginLink = await this.stripe.accounts.createLoginLink(accountId)
        return loginLink.url
    }

    async createCheckoutSession(params: {
        eventId: string
        quantity: number
        accountId: string
        metadata: any
    }): Promise<CheckoutSession> {
        const session = await this.stripe.checkout.sessions.create(
            {
                line_items: [
                    {
                        price_data: {
                            currency: 'gbp',
                            product_data: {
                                name: params.metadata.eventName,
                                description: params.metadata.eventDescription,
                            },
                            unit_amount: Math.round(params.metadata.price * 100),
                        },
                        quantity: params.quantity,
                    },
                ],
                payment_intent_data: {
                    application_fee_amount: Math.round(params.metadata.price * params.quantity * 100 * 0.01),
                },
                expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/event/${params.eventId}`,
                metadata: params.metadata,
            },
            {
                stripeAccount: params.accountId,
            },
        )

        return {
            sessionId: session.id,
            sessionUrl: session.url!,
            provider: this.provider,
        }
    }

    async processRefund(paymentId: string, accountId: string, amount: number): Promise<void> {
        await this.stripe.refunds.create(
            {
                payment_intent: paymentId,
                reason: 'requested_by_customer',
            },
            {
                stripeAccount: accountId,
            },
        )
    }

    async verifyWebhook(body: string, signature: string): Promise<any> {
        const _ = this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
        return true
    }
}
