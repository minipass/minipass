import { Doc } from '../../../convex/_generated/dataModel'
import { CheckoutSession, PaymentProvider } from '../../../convex/types'

export abstract class PaymentProviderBase {
    abstract provider: PaymentProvider

    abstract createAccountLink(accountId: string): Promise<{ url: string }>
    abstract createAccount(accountData: {
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
        personType: 'FISICA' | 'JURIDICA'
    }): Promise<{ accountId: string; walletId?: string }>

    abstract createCheckoutSession(params: {
        accountId: string
        event: Doc<'events'>
        quantity: number
        feePercentage: number
    }): Promise<CheckoutSession>

    abstract processRefund(paymentId: string, accountId: string, amount: number): Promise<void>

    abstract verifyWebhook(body: string, signature: string): Promise<any>
}
