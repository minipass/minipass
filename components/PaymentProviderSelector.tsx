import Image, { StaticImageData } from 'next/image'

import { PaymentProvider } from '@/convex/types'

import { cn } from '@/lib/css'
import asaasLogo from '@/public/images/asaas-logo.png'
import stripeLogo from '@/public/images/stripe-logo.png'

interface PaymentProviderSelectorProps {
    selectedProvider: PaymentProvider | null
    onProviderChange: (provider: PaymentProvider) => void
    availableProviders: PaymentProvider[]
}

interface ProviderConfig {
    name: string
    logo: StaticImageData
    description: string
    color: string
}

export const PROVIDER_CONFIGS: Record<PaymentProvider, ProviderConfig> = {
    stripe: {
        name: 'Stripe',
        logo: stripeLogo,
        description: 'Processamento global de pagamentos, suporta cartões de crédito e boleto',
        color: 'bg-blue-500',
    },
    asaas: {
        name: 'Asaas',
        logo: asaasLogo,
        description: 'Processamento de pagamentos para o Brasil, suporta cartões de crédito, boleto e PIX',
        color: 'bg-green-500',
    },
}

export default function PaymentProviderSelector({
    selectedProvider,
    onProviderChange,
    availableProviders,
}: PaymentProviderSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableProviders.map(provider => {
                    const config = PROVIDER_CONFIGS[provider]
                    const isSelected = selectedProvider === provider

                    return (
                        <button
                            key={provider}
                            onClick={() => onProviderChange(provider)}
                            className={cn(
                                'p-4 border-2 rounded-sm transition-all',
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                                    <Image
                                        src={config.logo}
                                        alt={`${config.name} logo`}
                                        width={32}
                                        height={32}
                                        className="rounded-sm"
                                    />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">{config.name}</div>
                                    <div className="text-sm text-gray-500">{config.description}</div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
