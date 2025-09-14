import { auth } from '@clerk/nextjs/server'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import SellerEventList from '@/components/SellerEventList'

export default async function SellerEventsPage() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/seller"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Meus Eventos</h1>
                                <p className="mt-1 text-muted-foreground">
                                    Gerencie suas listagens de eventos e acompanhe as vendas
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/seller/new-event"
                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Evento
                        </Link>
                    </div>
                </div>

                {/* Event List */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <SellerEventList />
                </div>
            </div>
        </div>
    )
}
