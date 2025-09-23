import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function Return() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-card border border-secondary rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                        <div className="mb-4 flex justify-center">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Conta Conectada!</h2>
                        <p className="text-green-100">Sua conta Asaas foi conectada com sucesso</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-sm p-4">
                                <h3 className="font-medium text-green-900 mb-1">O que acontece agora?</h3>
                                <ul className="text-sm text-green-700 space-y-2">
                                    <li>• Adicione uma chave PIX no seu painel Asaas para habilitar pagamentos PIX</li>
                                    <li>• Após isso, você pode criar e vender ingressos para eventos</li>
                                    <li>• Os pagamentos serão processados através da sua conta Asaas</li>
                                    <li>• minipass cobrará uma pequena taxa de 2% em cada transação</li>
                                </ul>
                            </div>

                            <Link
                                href="/dashboard/seller/events"
                                className="flex w-full bg-primary text-primary-foreground text-center py-3 px-4 rounded-sm font-medium hover:bg-primary/90 transition-colors duration-200 items-center justify-center gap-2"
                            >
                                Ver Meus Eventos
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
