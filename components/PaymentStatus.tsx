'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { PaymentProvider } from '@/convex/types'

import { PROVIDER_CONFIGS } from './PaymentProviderSelector'
import Spinner from './Spinner'

export default function PaymentStatus() {
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
    const [isSetup, setIsSetup] = useState(false)

    const { user } = useUser()

    // Convex queries
    const paymentAccounts = useQuery(api.payment.getUsersPaymentAccounts, {
        userId: user?.id || '',
    })

    // Determine setup status
    useEffect(() => {
        if (paymentAccounts) {
            if (paymentAccounts.stripeConnectId) {
                setSelectedProvider('stripe')
                setIsSetup(true)
            } else if (paymentAccounts.asaasSubaccountId) {
                setSelectedProvider('asaas')
                setIsSetup(true)
            } else {
                setSelectedProvider(null)
                setIsSetup(false)
            }
        }
    }, [paymentAccounts])

    if (paymentAccounts === undefined) {
        return <Spinner />
    }

    // Don't render anything if not setup
    if (!isSetup) {
        return null
    }

    return (
        <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    {selectedProvider && (
                        <Image
                            src={PROVIDER_CONFIGS[selectedProvider].logo}
                            alt={`${PROVIDER_CONFIGS[selectedProvider].name} logo`}
                            width={16}
                            height={16}
                            className="rounded-sm"
                        />
                    )}
                    <span>Pagamentos processados via {selectedProvider === 'stripe' ? 'Stripe' : 'Asaas'}</span>
                </div>
                <span>•</span>
                <span>Transferidos para sua conta bancária</span>
            </div>
        </div>
    )
}
