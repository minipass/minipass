'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import Ticket from '@/components/Ticket'
import { cn } from '@/lib/css'

export default function TicketPage() {
    const params = useParams()
    const { user } = useUser()
    const ticket = useQuery(api.tickets.getTicketWithDetails, {
        ticketId: params.id as Id<'tickets'>,
    })

    useEffect(() => {
        if (!user) {
            redirect('/')
        }

        if (!ticket || ticket.userId !== user.id) {
            redirect('/dashboard/tickets')
        }

        if (!ticket.event) {
            redirect('/dashboard/tickets')
        }
    }, [user, ticket])

    if (!ticket || !ticket.event) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 space-y-8">
                    {/* Navigation and Actions */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard/tickets"
                            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar aos Meus Ingressos
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-accent">
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Salvar</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-accent">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">Compartilhar</span>
                            </button>
                        </div>
                    </div>

                    {/* Event Info Summary */}
                    <div
                        className={cn(
                            'bg-card p-6 rounded-sm shadow-sm border',
                            ticket.event.isCancelled ? 'border-destructive/20' : 'border-border',
                        )}
                    >
                        <h1 className="text-2xl font-bold text-foreground">{ticket.event.name}</h1>
                        <p className="mt-1 text-muted-foreground">
                            {new Date(ticket.event.eventDate).toLocaleDateString()} at {ticket.event.location}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <span
                                className={cn(
                                    'px-3 py-1 rounded-sm text-sm font-medium',
                                    ticket.event.isCancelled ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700',
                                )}
                            >
                                {ticket.event.isCancelled ? 'Cancelado' : 'Ingresso Válido'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Comprado em {new Date(ticket.purchasedAt).toLocaleDateString()}
                            </span>
                        </div>
                        {ticket.event.isCancelled && (
                            <p className="mt-4 text-sm text-red-600">
                                Este evento foi cancelado. Um reembolso será processado se ainda não foi feito.
                            </p>
                        )}
                    </div>
                </div>

                {/* Ticket Component */}
                <Ticket ticketId={ticket._id} />

                {/* Additional Information */}
                <div
                    className={cn(
                        'mt-8 rounded-sm p-4',
                        ticket.event.isCancelled
                            ? 'bg-red-50 border-red-100 border'
                            : 'bg-blue-50 border-blue-100 border',
                    )}
                >
                    <h3
                        className={cn(
                            'text-sm font-medium',
                            ticket.event.isCancelled ? 'text-red-900' : 'text-blue-900',
                        )}
                    >
                        Precisa de Ajuda?
                    </h3>
                    <p className={cn('mt-1 text-sm', ticket.event.isCancelled ? 'text-red-700' : 'text-blue-700')}>
                        {ticket.event.isCancelled
                            ? 'Para dúvidas sobre reembolsos ou cancelamentos, entre em contato com nossa equipe de suporte em team@papareact-tickr.com'
                            : 'Se você tiver algum problema com seu ingresso, entre em contato com nossa equipe de suporte em team@papareact-tickr.com'}
                    </p>
                </div>
            </div>
        </div>
    )
}
