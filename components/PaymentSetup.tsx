'use client'

import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { PaymentProvider } from '@/convex/types'

import { useToast } from '@/hooks/useToast'

import PaymentProviderSelector from './PaymentProviderSelector'
import Spinner from './Spinner'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function PaymentSetup() {
    const [accountCreatePending, setAccountCreatePending] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
    const [isSetup, setIsSetup] = useState(false)
    const [asaasApiKey, setAsaasApiKey] = useState('')
    const [showAsaasForm, setShowAsaasForm] = useState(false)
    const [showStripeForm, setShowStripeForm] = useState(false)

    const router = useRouter()
    const { user } = useUser()
    const { toast } = useToast()

    // Convex actions and queries
    const paymentAccounts = useQuery(api.payment.getUsersPaymentAccounts, {
        userId: user?.id || '',
    })

    const createStripeAccount = useAction(api.payment.createStripePaymentAccount)
    const createAsaasAccount = useAction(api.payment.createAsaasPaymentAccount)

    // Determine setup status
    useEffect(() => {
        if (paymentAccounts) {
            if (paymentAccounts.stripeConnectId) {
                setSelectedProvider('stripe')
                setIsSetup(true)
            } else if (paymentAccounts.asaasApiKey) {
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

        if (provider === 'stripe') {
            // For Stripe, show explanation form
            setShowStripeForm(true)
        } else if (provider === 'asaas') {
            // For Asaas, show API key form
            setShowAsaasForm(true)
        }
    }

    const handleCreateStripeAccount = async () => {
        if (!user?.id) return

        setAccountCreatePending(true)
        try {
            const result = await createStripeAccount({
                userId: user.id,
            })

            // Redirect to the setup URL returned from the backend
            if (result.url) {
                router.push(result.url)
            }
        } catch (error) {
            console.error('Error creating Stripe account:', error)
            if (error instanceof ConvexError) {
                toast({
                    variant: 'destructive',
                    title: 'Oops! Algo deu errado.',
                    description: error.data,
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Oops! Algo deu errado.',
                    description: 'Erro ao criar conta Stripe. Entre em contato com o suporte.',
                })
            }
        } finally {
            setAccountCreatePending(false)
        }
    }

    const handleCreateAsaasAccount = async () => {
        if (!user?.id || !asaasApiKey.trim()) return

        setAccountCreatePending(true)
        try {
            const result = await createAsaasAccount({
                userId: user.id,
                apiKey: asaasApiKey.trim(),
            })

            // Redirect to the setup URL returned from the backend
            if (result.url) {
                router.push(result.url)
            }
        } catch (error) {
            console.error('Error creating Asaas account:', error)
            if (error instanceof ConvexError) {
                toast({
                    variant: 'destructive',
                    title: 'Oops! Algo deu errado.',
                    description: error.data,
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Oops! Algo deu errado.',
                    description: 'Erro ao criar conta Asaas. Entre em contato com o suporte.',
                })
            }
        } finally {
            setAccountCreatePending(false)
        }
    }

    const handleCancelAsaasSetup = () => {
        setShowAsaasForm(false)
        setSelectedProvider(null)
        setAsaasApiKey('')
    }

    const handleCancelStripeSetup = () => {
        setShowStripeForm(false)
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
                {!showAsaasForm && !showStripeForm && (
                    <div className="text-center py-6">
                        <h3 className="text-lg font-semibold mb-3 text-foreground">
                            Escolha Seu Provedor de Pagamento
                        </h3>
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
                )}

                {/* Stripe Setup Form */}
                {showStripeForm && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Configurar Conta Stripe</h3>
                            <p className="text-muted-foreground mb-4">
                                Você será redirecionado para o Stripe para configurar sua conta.
                            </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                                Como funciona a configuração:
                            </h4>
                            <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
                                <li>Clique no botão "Configurar Conta Stripe" abaixo</li>
                                <li>Você será redirecionado para a página do Stripe</li>
                                <li>Complete as informações solicitadas pelo Stripe</li>
                                <li>Após a configuração, você retornará automaticamente ao Minipass</li>
                            </ol>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreateStripeAccount}
                                disabled={accountCreatePending}
                                className="flex-1"
                            >
                                {accountCreatePending ? 'Configurando...' : 'Configurar Conta Stripe'}
                            </Button>
                            <Button variant="outline" onClick={handleCancelStripeSetup} disabled={accountCreatePending}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Asaas API Key Form */}
                {showAsaasForm && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Configurar Conta Asaas</h3>
                            <p className="text-muted-foreground mb-4">
                                Você precisa criar uma chave de API no Asaas para conectar sua conta.
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Como obter sua chave de API:
                            </h4>
                            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                                <li>
                                    Acesse:{' '}
                                    <a
                                        href="https://www.asaas.com/customerApiAccessToken/index"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium underline hover:no-underline"
                                    >
                                        https://www.asaas.com/customerApiAccessToken/index
                                    </a>
                                </li>
                                <li>
                                    Crie uma nova chave com o nome <strong>"minipass"</strong>
                                </li>
                                <li>
                                    <strong>Não defina uma data de expiração</strong>
                                </li>
                                <li>Copie a chave gerada e cole no campo abaixo</li>
                            </ol>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="asaas-api-key">Chave de API do Asaas</Label>
                                <Input
                                    id="asaas-api-key"
                                    type="text"
                                    value={asaasApiKey}
                                    onChange={e => setAsaasApiKey(e.target.value)}
                                    placeholder="Cole sua chave de API aqui..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreateAsaasAccount}
                                    disabled={!asaasApiKey.trim() || accountCreatePending}
                                    className="flex-1"
                                >
                                    {accountCreatePending ? 'Configurando...' : 'Conectar Conta Asaas'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelAsaasSetup}
                                    disabled={accountCreatePending}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {accountCreatePending && (
                    <div className="text-center py-4 text-muted-foreground">
                        {selectedProvider === 'stripe' ? 'Criando conta Stripe...' : 'Configurando conta Asaas...'}
                    </div>
                )}
            </div>
        </Card>
    )
}
