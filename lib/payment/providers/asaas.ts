import { Doc } from '../../../convex/_generated/dataModel'
import { CheckoutSession, PaymentProvider } from '../../../convex/types'
import { Asaas, asaas } from '../../asaas'
import { PaymentProviderBase } from './base'

export class AsaasProvider extends PaymentProviderBase {
    provider: PaymentProvider = 'asaas'
    private asaas: Asaas

    constructor() {
        super()
        this.asaas = asaas
    }

    // Asaas doesn't have account links like Stripe
    // This is a hardcoded page explaining that people need to configure their Asaas account in their email
    async createAccountLink(): Promise<{ url: string }> {
        return { url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/asaas/success` }
    }

    async createAccount(accountData: {
        name: string
        email: string
        birthDate: string
        cpfCnpj: string
        mobilePhone: string
        incomeValue: number
        address: string
        addressNumber: string
        province: string
        postalCode: string
    }) {
        const subaccountData = {
            name: accountData.name,
            email: accountData.email,
            birthDate: accountData.birthDate, // Crazy that this is required
            cpfCnpj: accountData.cpfCnpj,
            mobilePhone: accountData.mobilePhone,
            incomeValue: accountData.incomeValue, // Monthly billing value - required from May 30, 2024
            address: accountData.address,
            addressNumber: accountData.addressNumber,
            province: accountData.province,
            postalCode: accountData.postalCode,
            webhooks: [
                {
                    name: 'minipass - DO NOT DELETE',
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/asaas/webhook`,
                    email: accountData.email,
                    enabled: true,
                    interrupted: false,
                    sendType: 'SEQUENTIALLY',
                    events: ['CHECKOUT_PAID'],
                    authToken: this.asaas.webhookSignature,
                },
            ],
        }

        const subaccount = await this.asaas.makeRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify(subaccountData),
        })

        return {
            accountId: subaccount.apiKey,
            walletId: subaccount.walletId,
        }
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
                          walletId: this.asaas.walletId,
                          percentageValue: params.feePercentage,
                      },
                  ]

        // Create a checkout session in Asaas for the subaccount
        const checkoutSessionData = {
            billingTypes: ['CREDIT_CARD', 'PIX'],
            chargeTypes: ['DETACHED'],
            minutesToExpire: 60,
            callback: {
                successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/purchase-success`,
                expiredUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/purchase-expired`,
                cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/event/${params.event._id}`,
            },
            splits,
            items: [
                {
                    name: params.event.name,
                    description: params.event.description,
                    quantity: params.quantity,
                    value: params.event.price.toFixed(2),
                },
            ],
        }

        const checkoutSession = await this.asaas.makeRequest(
            '/checkouts',
            {
                method: 'POST',
                body: JSON.stringify(checkoutSessionData),
            },
            params.accountId, // Make sure the charge is done in the name of the subaccount
        )

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

        await this.asaas.makeRequest(
            `/payments/${paymentId}/refund`,
            {
                method: 'POST',
                body: JSON.stringify(refundData),
            },
            accountId,
        )
    }

    async verifyWebhook(body: string, signature: string) {
        if (!this.asaas.verifyWebhook(signature)) {
            throw new Error('Invalid webhook signature')
        }

        return true
    }
}
