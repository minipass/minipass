'use client'

import { useQuery } from 'convex/react'
import { AlertTriangle, ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { cn } from '@/lib/css'

import Spinner from './Spinner'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

export default function TicketCard({ ticketId }: { ticketId: Id<'tickets'> }) {
    const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId })

    if (!ticket || !ticket.event) return <Spinner />

    const isPastEvent = ticket.event.eventDate < Date.now()

    const getStatusVariant = () => {
        if (ticket.event!.is_cancelled) return 'destructive'
        if (ticket.status === 'valid') return isPastEvent ? 'default' : 'success'
        if (ticket.status === 'used') return 'default'
        if (ticket.status === 'refunded' || ticket.status === 'cancelled') return 'destructive'
        return 'default'
    }

    const statusText = {
        valid: isPastEvent ? 'Terminado' : 'Válido',
        used: 'Usado',
        refunded: 'Reembolsado',
        cancelled: 'Cancelado',
    }

    return (
        <Link
            href={`/tickets/${ticketId}`}
            className={cn(
                'block hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden',
                ticket.event.is_cancelled ? 'border-red-200' : '',
                isPastEvent && 'opacity-75 hover:opacity-100',
            )}
        >
            <Card className="h-full">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{ticket.event.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Comprado em {new Date(ticket.purchasedAt).toLocaleDateString()}
                            </p>
                            {ticket.event.is_cancelled && (
                                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Evento Cancelado
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={getStatusVariant()} className="text-sm font-medium">
                                {ticket.event.is_cancelled ? 'Cancelado' : statusText[ticket.status]}
                            </Badge>
                            {isPastEvent && !ticket.event.is_cancelled && (
                                <Badge variant="default" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Evento Passado
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                            <CalendarDays className={cn('w-4 h-4 mr-2', ticket.event.is_cancelled && 'text-red-600')} />
                            <span className="text-sm">{new Date(ticket.event.eventDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className={cn('w-4 h-4 mr-2', ticket.event.is_cancelled && 'text-red-600')} />
                            <span className="text-sm">{ticket.event.location}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span
                            className={cn(
                                'font-medium',
                                ticket.event.is_cancelled
                                    ? 'text-red-600'
                                    : isPastEvent
                                      ? 'text-gray-600'
                                      : 'text-blue-600',
                            )}
                        >
                            R$ {ticket.event.price.toFixed(2)}
                        </span>
                        <span className="text-gray-600 flex items-center">
                            Ver Ingresso <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
