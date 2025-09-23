'use client'

import { useAction } from 'convex/react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'

export default function Refresh() {
    const params = useParams()
    const connectedAccountId = params.id as string
    const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false)
    const [error, setError] = useState(false)
    const createAccountLink = useAction(api.payment.createAccountLink)

    useEffect(() => {
        const handleCreateAccountLink = async () => {
            if (connectedAccountId) {
                setAccountLinkCreatePending(true)
                setError(false)
                try {
                    const { url } = await createAccountLink({
                        provider: 'stripe',
                        accountId: connectedAccountId,
                    })
                    window.location.href = url
                } catch (error) {
                    console.error('Error creating account link:', error)
                    setError(true)
                }
                setAccountLinkCreatePending(false)
            }
        }

        handleCreateAccountLink()
    }, [connectedAccountId, createAccountLink])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-card border border-secondary rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                        <h2 className="text-2xl font-bold mb-2">Configuração da Conta</h2>
                        <p className="text-primary-foreground/80">
                            Complete a configuração da sua conta para começar a vender ingressos
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error ? (
                            <div className="bg-red-50 border border-red-100 rounded-sm p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-red-900 mb-1">Algo deu errado</h3>
                                    <p className="text-sm text-red-700">
                                        Não conseguimos atualizar o link da sua conta. Tente novamente ou entre em
                                        contato com o suporte se o problema persistir.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-primary">
                                    {accountLinkCreatePending
                                        ? 'Criando o link da sua conta...'
                                        : 'Redirecionando para o Stripe...'}
                                </p>
                                {connectedAccountId && (
                                    <p className="text-xs text-muted-foreground mt-4">
                                        ID da Conta: {connectedAccountId}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
