import Stripe from 'stripe'

import { Doc } from '../../../convex/_generated/dataModel'
import { CheckoutSession, PaymentProvider } from '../../../convex/types'
import { stripe } from '../../stripe'
import { PaymentProviderBase } from './base'

export class StripeProvider extends PaymentProviderBase {
    provider: PaymentProvider = 'stripe'
    private stripe: Stripe

    constructor() {
        super()
        this.stripe = stripe
    }

    async createAccountLink(accountId: string): Promise<{ url: string }> {
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/stripe/refresh/${accountId}`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/stripe/return/${accountId}`,
            type: 'account_onboarding',
        })

        return { url: accountLink.url }
    }

    async createAccount() {
        const account = await this.stripe.accounts.create({
            type: 'express',
            capabilities: { card_payments: { requested: true } },
        })

        return { accountId: account.id }
    }

    async createCheckoutSession(params: {
        accountId: string
        event: Doc<'events'>
        quantity: number
        feePercentage: number
        metadata: any
    }): Promise<CheckoutSession> {
        // If the fee percentage is 0, we don't need to add an application fee
        const paymentIntentData =
            params.feePercentage === 0
                ? undefined
                : {
                      application_fee_amount: Math.round(
                          params.event.price * params.quantity * 100 * (params.feePercentage / 100),
                      ),
                  }

        const session = await this.stripe.checkout.sessions.create(
            {
                line_items: [
                    {
                        price_data: {
                            currency: 'brl',
                            product_data: {
                                name: params.event.name,
                                description: params.event.description,
                            },
                            unit_amount: Math.round(params.event.price * 100),
                        },
                        quantity: params.quantity,
                    },
                ],
                payment_intent_data: paymentIntentData,
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/event/${params.event._id}`,
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
                amount: amount,
            },
            {
                stripeAccount: accountId,
            },
        )
    }

    async verifyWebhook(body: string, signature: string): Promise<any> {
        return this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    }
}
