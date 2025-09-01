export type PaymentProvider = 'stripe' | 'asaas'

export interface AccountStatus {
    isActive: boolean
    requiresInformation: boolean
    requirements: {
        currently_due: string[]
        eventually_due: string[]
        past_due: string[]
    }
    chargesEnabled: boolean
    payoutsEnabled: boolean
}

export interface CheckoutSession {
    sessionId: string
    sessionUrl: string
    provider: PaymentProvider
}

export interface PaymentInfo {
    paymentIntentId: string
    amount: number
    provider: PaymentProvider
}
