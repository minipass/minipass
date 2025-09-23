import { Doc } from '../../../convex/_generated/dataModel'
import { CheckoutSession, PaymentProvider } from '../../../convex/types'

export abstract class PaymentProviderBase {
    abstract provider: PaymentProvider

    abstract createAccount(data?: any): Promise<{ url: string }>
    abstract getAccountLink(data?: any): Promise<{ url: string }>

    abstract createCheckoutSession(params: {
        accountId: string
        event: Doc<'events'>
        quantity: number
        feePercentage: number
    }): Promise<CheckoutSession>

    abstract processRefund(paymentId: string, accountId: string, amount: number): Promise<void>

    abstract verifyWebhook(body: string, signature: string): Promise<any>
}
