'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { CreditCard, Plus } from 'lucide-react'
import Link from 'next/link'

import { api } from '@/convex/_generated/api'

import { Button } from './ui/button'

export default function SellerEventsHeader() {
    const { user } = useUser()
    const paymentAccounts = useQuery(api.payment.getUsersPaymentAccounts, {
        userId: user?.id || '',
    })

    const isPaymentSetup = paymentAccounts?.stripeConnectId || paymentAccounts?.asaasSubaccountId

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Meus Eventos</h1>
                        <p className="mt-1 text-muted-foreground">
                            Gerencie suas listagens de eventos e acompanhe as vendas
                        </p>
                    </div>
                </div>
                {!isPaymentSetup ? (
                    <Button variant="secondary" disabled>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Configure o pagamento primeiro
                    </Button>
                ) : (
                    <Button asChild>
                        <Link href="/dashboard/seller/events/new">
                            <Plus className="w-5 h-5 mr-2" />
                            Criar Evento
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
