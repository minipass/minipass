'use client'

import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { PaymentProvider } from '@/convex/types'

import AccountSetupForm from './AccountSetupForm'
import PaymentProviderSelector from './PaymentProviderSelector'
import Spinner from './Spinner'
import { Card } from './ui/card'

export default function PaymentSetup() {
    const [accountCreatePending, setAccountCreatePending] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
    const [isSetup, setIsSetup] = useState(false)
    const [showAccountForm, setShowAccountForm] = useState(false)

    const router = useRouter()
    const { user } = useUser()

    // Convex actions and queries
    const paymentAccounts = useQuery(api.payment.getUsersPaymentAccounts, {
        userId: user?.id || '',
    })

    const createPaymentAccount = useAction(api.payment.createPaymentAccount)
    const createAccountLink = useAction(api.payment.createAccountLink)

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

    const handleProviderSelect = (provider: PaymentProvider) => {
        setSelectedProvider(provider)
        setShowAccountForm(true)
    }

    const handleCreateAccount = async (accountData: {
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
    }) => {
        if (!user?.id || !selectedProvider) return

        setAccountCreatePending(true)
        try {
            const paymentAccount = await createPaymentAccount({
                userId: user.id,
                provider: selectedProvider,
                accountData,
            })

            const accountLink = await createAccountLink({
                provider: selectedProvider,
                accountId: paymentAccount.account,
            })

            // Redirect to the setup URL returned from the backend
            if (accountLink.url) {
                router.push(accountLink.url)
            }
        } catch (error) {
            console.error('Error creating payment account:', error)
        } finally {
            setAccountCreatePending(false)
        }
    }

    const handleCancelAccountSetup = () => {
        setShowAccountForm(false)
        setSelectedProvider(null)
    }

    if (paymentAccounts === undefined) {
        return <Spinner />
    }

    // Don't render anything if already setup
    if (isSetup) {
        return null
    }

    return (
        <Card className="overflow-hidden">
            {/* Header Section */}
            <div className="bg-card px-6 py-6 border-b border-border">
                <h2 className="text-xl font-bold">Configuração de Pagamento</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Configure seu provedor de pagamento para começar a vender ingressos
                </p>
            </div>

            <div className="p-6">
                {/* Provider Selection Section */}
                <div className="text-center py-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Escolha Seu Provedor de Pagamento</h3>
                    <p className="text-muted-foreground mb-6">
                        Selecione um provedor de pagamento para começar a aceitar pagamentos.
                    </p>
                    <PaymentProviderSelector
                        selectedProvider={selectedProvider}
                        onProviderChange={handleProviderSelect}
                        availableProviders={['stripe', 'asaas']}
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                        Precisa trocar de provedor? Entre em contato com o suporte para assistência.
                    </p>
                </div>

                {showAccountForm && (
                    <AccountSetupForm
                        provider={selectedProvider}
                        onSubmit={handleCreateAccount}
                        onCancel={handleCancelAccountSetup}
                        isLoading={accountCreatePending}
                    />
                )}

                {/* Loading State */}
                {accountCreatePending && (
                    <div className="text-center py-4 text-muted-foreground">Configurando sua conta de pagamento...</div>
                )}
            </div>
        </Card>
    )
}
