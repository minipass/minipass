import { PaymentProvider } from '../../convex/types'
import { AsaasProvider } from './providers/asaas'
import { PaymentProviderBase } from './providers/base'
import { StripeProvider } from './providers/stripe'

export class PaymentProviderFactory {
    private static providers: Record<PaymentProvider, PaymentProviderBase> = {
        stripe: new StripeProvider(),
        asaas: new AsaasProvider(),
    }

    static getProvider(provider: PaymentProvider): PaymentProviderBase {
        return this.providers[provider]
    }
}
