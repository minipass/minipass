export type PaymentProvider = 'stripe' | 'asaas'

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
