import { AccountStatus, CheckoutSession, PaymentProvider } from '../../../convex/types'

export abstract class PaymentProviderBase {
    abstract provider: PaymentProvider

    abstract createAccount(
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
    ): Promise<{ accountId: string; walletId: string | null }>
    abstract getAccountStatus(accountId: string): Promise<AccountStatus>
    abstract createAccountLink(accountId: string): Promise<{ url: string }>
    abstract createLoginLink(accountId: string): Promise<string>
    abstract createCheckoutSession(params: {
        eventId: string
        quantity: number
        accountId: string
        metadata: any
    }): Promise<CheckoutSession>
    abstract processRefund(paymentId: string, accountId: string, amount: number): Promise<void>
    abstract verifyWebhook(body: string, signature: string): Promise<boolean>
}
