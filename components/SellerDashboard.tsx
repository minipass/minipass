'use client'

import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { CalendarDays, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { PaymentProvider } from '@/convex/types'

import AccountSetupForm from './AccountSetupForm'
import PaymentProviderSelector from './PaymentProviderSelector'
import Spinner from './Spinner'

export default function SellerDashboard() {
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
            const result = await createPaymentAccount({
                userId: user.id,
                provider: selectedProvider,
                accountData,
            })
            // Redirect to the setup URL returned from the backend
            if (result.url) {
                router.push(result.url)
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
                    <h2 className="text-2xl font-bold">Seller Dashboard</h2>
                    <p className="text-blue-100 mt-2">Manage your seller profile and payment settings</p>
                </div>

                {/* Main Content */}
                {isSetup && (
                    <>
                        <div className="bg-white p-8 rounded-lg">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sell tickets for your events</h2>
                            <p className="text-gray-600 mb-8">List your tickets for sale and manage your listings</p>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex justify-center gap-4">
                                    <Link
                                        href="/seller/new-event"
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Event
                                    </Link>
                                    <Link
                                        href="/seller/events"
                                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <CalendarDays className="w-5 h-5" />
                                        View My Events
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
                                        {selectedProvider === 'stripe' ? '💳' : '🇧🇷'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {selectedProvider === 'stripe' ? 'Stripe' : 'Asaas'}
                                        </div>
                                        <div className="text-sm text-gray-500">Payment provider configured</div>
                                    </div>
                                </div>
                                <p className="text-green-800 mb-4">
                                    Your payment provider is set up and ready to accept payments.
                                </p>
                                <p className="text-xs text-gray-500">
                                    Need to change providers? Contact support for assistance.
                                </p>
                            </div>
                        </div>
                    ) : showAccountForm && selectedProvider ? (
                        <AccountSetupForm
                            provider={selectedProvider}
                            onSubmit={handleCreateAccount}
                            onCancel={handleCancelAccountSetup}
                            isLoading={accountCreatePending}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-semibold mb-4">Choose Your Payment Provider</h3>
                            <p className="text-gray-600 mb-6">
                                Select a payment provider to start accepting payments. This choice cannot be changed
                                later.
                            </p>
                            <PaymentProviderSelector
                                selectedProvider="stripe"
                                onProviderChange={handleProviderSelect}
                                availableProviders={['stripe', 'asaas']}
                            />
                            <p className="text-xs text-gray-500 mt-4">
                                Need to switch providers? Contact support for assistance.
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {accountCreatePending && (
                        <div className="text-center py-4 text-gray-600">Setting up your payment account...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
