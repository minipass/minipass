import { PaymentProvider } from '../../convex/types'
import { AsaasProvider } from './providers/asaas'
import { PaymentProviderBase } from './providers/base'
import { StripeProvider } from './providers/stripe'

export class PaymentProviderFactory {
    private static providers: Map<PaymentProvider, PaymentProviderBase> = new Map()

    static getProvider(provider: PaymentProvider): PaymentProviderBase {
        if (!this.providers.has(provider)) {
            switch (provider) {
                case 'stripe':
                    this.providers.set(provider, new StripeProvider())
                    break
                case 'asaas':
                    this.providers.set(provider, new AsaasProvider())
                    break
                default:
                    throw new Error(`Unsupported payment provider: ${provider}`)
            }
        }
        return this.providers.get(provider)!
    }

    static getAvailableProviders(): PaymentProvider[] {
        const providers: PaymentProvider[] = []

        if (process.env.STRIPE_SECRET_KEY) {
            providers.push('stripe')
        }

        if (process.env.ASAAS_API_KEY) {
            providers.push('asaas')
        }

        return providers
    }
}
