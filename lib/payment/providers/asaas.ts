import { Asaas, asaas } from '@/lib/asaas'

import { AccountStatus, CheckoutSession, PaymentProvider } from '../../../convex/types'
import { PaymentProviderBase } from './base'

export class AsaasProvider extends PaymentProviderBase {
    provider: PaymentProvider = 'asaas'
    private asaas: Asaas

    constructor() {
        super()
        this.asaas = asaas
    }

    // TODO: Implement webhook handling
    async createAccount(
        userId: string,
        accountData: {
            name: string
            email: string
            cpfCnpj: string
            mobilePhone: string
            incomeValue: number
            address: string
            addressNumber: string
            province: string
            postalCode: string
            personType: 'FISICA' | 'JURIDICA'
        },
    ) {
        // Create a subaccount in Asaas (similar to Stripe Connect accounts)
        const subaccountData = {
            name: accountData.name,
            email: accountData.email,
            phone: '',
            mobilePhone: accountData.mobilePhone,
            address: accountData.address,
            addressNumber: accountData.addressNumber,
            complement: '',
            province: accountData.province,
            postalCode: accountData.postalCode,
            cpfCnpj: accountData.cpfCnpj,
            personType: accountData.personType, // FISICA for individual, JURIDICA for business
            companyEmail: '',
            municipalInscription: '',
            stateInscription: '',
            observations: '',
            externalReference: userId,
            notificationDisabled: false,
            additionalEmails: '',
            // Required fields for subaccount creation
            incomeValue: accountData.incomeValue, // Monthly billing value - required from May 30, 2024
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

    async getAccountStatus(accountId: string): Promise<AccountStatus> {
        // Check subaccount status in Asaas
        try {
            const subaccount = await this.asaas.makeRequest(`/accounts/${accountId}`)

            // For Asaas subaccounts, we check if the account is active
            // and can receive payments
            return {
                isActive: subaccount.active, // Check if subaccount is active
                requiresInformation: false, // Asaas doesn't have requirements like Stripe
                requirements: {
                    currently_due: [],
                    eventually_due: [],
                    past_due: [],
                },
                chargesEnabled: subaccount.active, // Active subaccounts can receive charges
                payoutsEnabled: subaccount.active, // Active subaccounts can receive payouts
            }
        } catch {
            // If subaccount doesn't exist, return inactive status
            return {
                isActive: false,
                requiresInformation: false,
                requirements: {
                    currently_due: [],
                    eventually_due: [],
                    past_due: [],
                },
                chargesEnabled: false,
                payoutsEnabled: false,
            }
        }
    }

    // TODO: Handle this by redirecting to the user's email
    async createAccountLink(accountId: string): Promise<{ url: string }> {
        // Asaas doesn't have account links like Stripe
        // You'd redirect to their onboarding flow or create a custom form
        return { url: `${process.env.NEXT_PUBLIC_APP_URL}/asaas/onboarding/${accountId}` }
    }

    // TODO: Handle this by redirecting to the user's email
    async createLoginLink(accountId: string): Promise<string> {
        // Asaas doesn't have login links like Stripe
        // You'd redirect to their dashboard or create a custom interface
        return `${process.env.NEXT_PUBLIC_APP_URL}/asaas/dashboard/${accountId}`
    }

    // TODO: Implement checkout session creation
    async createCheckoutSession(params: {
        eventId: string
        quantity: number
        accountId: string
        metadata: any
    }): Promise<CheckoutSession> {
        // Create a payment link in Asaas for the subaccount
        const paymentData = {
            customer: params.accountId, // This will be the subaccount ID
            billingType: 'PIX', // Can be PIX, BOLETO, CREDIT_CARD, etc.
            value: (params.metadata.price * params.quantity).toFixed(2),
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due tomorrow
            description: `${params.metadata.eventName} - ${params.quantity} ticket(s)`,
            externalReference: `${params.eventId}_${params.metadata.userId}_${Date.now()}`,
            notificationEnabled: true,
            callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/asaas/webhook`,
            // TODO: Implement split for the payment properly by using the user account
            split: {
                walletId: this.asaas.walletId, // Your main wallet ID
                fixedValue: (params.metadata.price * params.quantity * 0.01).toFixed(2), // 1% fee
            },
            // Additional metadata
            meta: {
                eventId: params.eventId,
                userId: params.metadata.userId,
                waitingListId: params.metadata.waitingListId,
                eventName: params.metadata.eventName,
                eventDescription: params.metadata.eventDescription,
                quantity: params.quantity.toString(),
            },
        }

        const payment = await this.asaas.makeRequest('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        })

        // Create a payment link for the subaccount to pay
        const paymentLinkData = {
            customer: params.accountId,
            billingType: paymentData.billingType,
            value: paymentData.value,
            dueDate: paymentData.dueDate,
            description: paymentData.description,
            externalReference: paymentData.externalReference,
            notificationEnabled: true,
            callback: paymentData.callback,
            split: paymentData.split,
            meta: paymentData.meta,
        }

        const paymentLink = await this.asaas.makeRequest('/paymentLinks', {
            method: 'POST',
            body: JSON.stringify(paymentLinkData),
        })

        return {
            sessionId: payment.id,
            sessionUrl: paymentLink.url,
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
