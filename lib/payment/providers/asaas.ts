import { Doc } from '../../../convex/_generated/dataModel'
import { CheckoutSession, PaymentProvider } from '../../../convex/types'
import { Asaas, asaas } from '../../asaas'
import { PaymentProviderBase } from './base'

export class AsaasProvider implements PaymentProviderBase {
    provider: PaymentProvider = 'asaas'
    private asaas: Asaas

    constructor() {
        this.asaas = asaas
    }

    // Asaas doesn't have account links like Stripe
    // This is a hardcoded page explaining that people just need to use their Asaas account as is
    // We do hit their API to validate the API key and get the wallet ID
    async createAccount({ apiKey }: { apiKey: string }) {
        // Validate the API key and get the wallet ID for splits
        const wallets = await this.asaas.makeRequest('/wallets', { method: 'GET' }, apiKey)

        const walletId = wallets.data[0].id

        // Create a webhook to receive payments from the account
        await this.asaas.makeRequest(
            '/webhooks',
            {
                method: 'POST',
                body: JSON.stringify({
                    name: 'minipass - DO NOT DELETE',
                    url:
                        process.env.IS_DEV === 'false'
                            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/asaas/webhook`
                            : `https://minipass.com.br/api/asaas/webhook`,
                    email: 'rafaeelaudibert+minipass@gmail.com',
                    enabled: true,
                    interrupted: false,
                    sendType: 'SEQUENTIALLY',
                    events: ['CHECKOUT_PAID'],
                    authToken: this.asaas.webhookSignature,
                }),
            },
            apiKey,
        )

        // Generate an account link to the success page
        const { url } = await this.getAccountLink()

        return { walletId, url }
    }

    // Asaas doesn't have account links like Stripe
    // This is a hardcoded page explaining that people just need to use their Asaas account as is
    async getAccountLink() {
        return { url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/asaas/success` }
    }

    async createCheckoutSession(params: {
        accountId: string
        event: Doc<'events'>
        quantity: number
        feePercentage: number
    }): Promise<CheckoutSession> {
        // If the fee percentage is 0, we don't need to add a split
        // Configure splits for our own account, the rest will go to the subaccount
        const splits =
            params.feePercentage === 0
                ? []
                : [
                      {
                          walletId: params.accountId,
                          percentageValue: 100 - params.feePercentage,
                      },
                  ]

        // Create a checkout session in Asaas for the subaccount
        const checkoutSessionData = {
            billingTypes: ['CREDIT_CARD', 'PIX'],
            chargeTypes: ['DETACHED'],
            minutesToExpire: 60,
            callback: {
                successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/purchase-success`,
                expiredUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/purchase-expired`,
                cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/event/${params.event._id}`,
            },
            splits,
            items: [
                {
                    name: params.event.name.slice(0, 30),
                    description: params.event.description,
                    quantity: params.quantity,
                    value: params.event.price.toFixed(2),
                },
            ],
        }

        const checkoutSession = await this.asaas.makeRequest('/checkouts', {
            method: 'POST',
            body: JSON.stringify(checkoutSessionData),
        })

        return {
            sessionId: checkoutSession.id,
            sessionUrl: `${this.asaas.baseUrl}/checkoutSession/show?id=${checkoutSession.id}`,
            provider: this.provider,
        }
    }

    async processRefund(paymentId: string, accountId: string, amount: number) {
        // Create a refund in Asaas
        const refundData = {
            value: amount.toFixed(2),
            description: 'Refund requested by customer',
        }

        await this.asaas.makeRequest(`/payments/${paymentId}/refund`, {
            method: 'POST',
            body: JSON.stringify(refundData),
        })
    }

    async verifyWebhook(body: string, signature: string) {
        if (!this.asaas.verifyWebhook(signature)) {
            throw new Error('Invalid webhook signature')
        }

        return true
    }
}
