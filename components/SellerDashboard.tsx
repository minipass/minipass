'use client'

import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { CalendarDays, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { PaymentProvider } from '@/convex/types'

import { cn } from '@/lib/css'

import AccountSetupForm from './AccountSetupForm'
import PaymentProviderSelector, { PROVIDER_CONFIGS } from './PaymentProviderSelector'
import Spinner from './Spinner'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function SellerDashboard() {
    const [accountCreatePending, setAccountCreatePending] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
    const [isSetup, setIsSetup] = useState(false)
    const [showAccountForm, setShowAccountForm] = useState(false)

    const router = useRouter()
    const { user } = useUser()

    console.log('this is the user', user)

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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-white">
                    <h2 className="text-3xl font-bold">Painel do Vendedor</h2>
                    <p className="text-blue-100 mt-2 text-lg">
                        Gerencie seu perfil de vendedor e configurações de pagamento
                    </p>
                </div>

                {/* Main Content */}
                {isSetup && (
                    <>
                        <div className="bg-white p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Venda ingressos para seus eventos
                            </h2>
                            <p className="text-gray-600 mb-8">Liste seus ingressos à venda e gerencie suas listagens</p>
                            <div className="bg-gray-50 rounded-sm border border-gray-200 p-6">
                                <div className="flex justify-center gap-4">
                                    <Button asChild>
                                        <Link href="/seller/new-event">
                                            <Plus className="w-5 h-5" />
                                            Criar Evento
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" asChild>
                                        <Link href="/seller/events">
                                            <CalendarDays className="w-5 h-5" />
                                            Ver Meus Eventos
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <hr className="my-8" />
                    </>
                )}

                <div className="p-6">
                    {/* Provider Status Section */}
                    {isSetup ? (
                        <div className="text-center py-8">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-8 mb-6">
                                <div className="flex items-center justify-center space-x-3 mb-6">
                                    <div
                                        className={cn(
                                            'w-12 h-12 rounded-sm flex items-center justify-center text-white text-lg ',
                                            selectedProvider === 'stripe' ? 'bg-blue-600' : 'bg-emerald-600',
                                        )}
                                    >
                                        {selectedProvider && (
                                            <Image
                                                src={PROVIDER_CONFIGS[selectedProvider].logo}
                                                alt={`${PROVIDER_CONFIGS[selectedProvider].name} logo`}
                                                width={32}
                                                height={32}
                                                className="rounded-sm"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-lg">
                                            {selectedProvider === 'stripe' ? 'Stripe' : 'Asaas'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-emerald-800 mb-4 text-lg">
                                    Seu provedor de pagamento está configurado e pronto para aceitar pagamentos.
                                </p>
                                <p className="text-sm text-gray-600">
                                    Precisa trocar de provedor? Entre em contato com o suporte para assistência.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                                Escolha Seu Provedor de Pagamento
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                Selecione um provedor de pagamento para começar a aceitar pagamentos.
                            </p>
                            <PaymentProviderSelector
                                selectedProvider={selectedProvider}
                                onProviderChange={handleProviderSelect}
                                availableProviders={['stripe', 'asaas']}
                            />
                            <p className="text-sm text-gray-500 mt-6">
                                Precisa trocar de provedor? Entre em contato com o suporte para assistência.
                            </p>
                        </div>
                    )}

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
                        <div className="text-center py-4 text-gray-600">Configurando sua conta de pagamento...</div>
                    )}
                </div>
            </Card>
        </div>
    )
}
