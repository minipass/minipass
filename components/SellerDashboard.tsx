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

import AccountSetupForm from './AccountSetupForm'
import PaymentProviderSelector, { PROVIDER_CONFIGS } from './PaymentProviderSelector'
import Spinner from './Spinner'

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
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
                    <h2 className="text-2xl font-bold">Painel do Vendedor</h2>
                    <p className="text-blue-100 mt-2">Gerencie seu perfil de vendedor e configurações de pagamento</p>
                </div>

                {/* Main Content */}
                {isSetup && (
                    <>
                        <div className="bg-white p-8 rounded-lg">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Venda ingressos para seus eventos
                            </h2>
                            <p className="text-gray-600 mb-8">Liste seus ingressos à venda e gerencie suas listagens</p>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex justify-center gap-4">
                                    <Link
                                        href="/seller/new-event"
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Criar Evento
                                    </Link>
                                    <Link
                                        href="/seller/events"
                                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <CalendarDays className="w-5 h-5" />
                                        Ver Meus Eventos
                                    </Link>
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
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <div
                                        className={`w-8 h-8 rounded-full ${selectedProvider === 'stripe' ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center text-white text-lg`}
                                    >
                                        {selectedProvider && (
                                            <Image
                                                src={PROVIDER_CONFIGS[selectedProvider].logo}
                                                alt={`${PROVIDER_CONFIGS[selectedProvider].name} logo`}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {selectedProvider === 'stripe' ? 'Stripe' : 'Asaas'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-green-800 mb-4">
                                    Seu provedor de pagamento está configurado e pronto para aceitar pagamentos.
                                </p>
                                <p className="text-xs text-gray-500">
                                    Precisa trocar de provedor? Entre em contato com o suporte para assistência.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-semibold mb-4">Escolha Seu Provedor de Pagamento</h3>
                            <p className="text-gray-600 mb-6">
                                Selecione um provedor de pagamento para começar a aceitar pagamentos.
                            </p>
                            <PaymentProviderSelector
                                selectedProvider={selectedProvider}
                                onProviderChange={handleProviderSelect}
                                availableProviders={['stripe', 'asaas']}
                            />
                            <p className="text-xs text-gray-500 mt-4">
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
            </div>
        </div>
    )
}
