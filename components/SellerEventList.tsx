'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { Ban, Banknote, CalendarDays, Edit, InfoIcon, Ticket } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { Metrics } from '@/convex/events'

import { useStorageUrl } from '@/hooks/useStorageUrl'
import { cn } from '@/lib/css'

import CancelEventButton from './CancelEventButton'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function SellerEventList() {
    const { user } = useUser()
    const events = useQuery(api.events.getSellerEvents, {
        userId: user?.id ?? '',
    })

    if (!events) return null

    const upcomingEvents = events.filter(e => e.eventDate > Date.now())
    const pastEvents = events.filter(e => e.eventDate <= Date.now())

    return (
        <div className="mx-auto space-y-8">
            {/* Upcoming Events */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximos Eventos</h2>
                <div className="grid grid-cols-1 gap-6">
                    {upcomingEvents.map(event => (
                        <SellerEventCard key={event._id} event={event} />
                    ))}
                    {upcomingEvents.length === 0 && <p className="text-gray-500">Nenhum evento próximo</p>}
                </div>
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Eventos Passados</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {pastEvents.map(event => (
                            <SellerEventCard key={event._id} event={event} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function SellerEventCard({
    event,
}: {
    event: Doc<'events'> & {
        metrics: Metrics
    }
}) {
    const imageUrl = useStorageUrl(event.imageStorageId)
    const isPastEvent = event.eventDate < Date.now()

    return (
        <Card
            className={cn(
                'hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden',
                event.is_cancelled ? 'border-red-200' : '',
            )}
        >
            <div className="p-6">
                <div className="flex items-start gap-6">
                    {/* Event Image */}
                    {imageUrl && (
                        <div className="relative w-40 h-40 rounded-sm overflow-hidden shrink-0">
                            <Image src={imageUrl} alt={event.name} fill className="object-cover" />
                        </div>
                    )}

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                                <p className="mt-1 text-gray-500">{event.description}</p>
                                {event.is_cancelled && (
                                    <div className="mt-2">
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <Ban className="w-3 h-3" />
                                            Evento Cancelado e Reembolsado
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {!isPastEvent && !event.is_cancelled && (
                                    <>
                                        <Button variant="secondary" size="sm" asChild>
                                            <Link href={`/seller/events/${event._id}/edit`}>
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </Link>
                                        </Button>
                                        <CancelEventButton eventId={event._id} />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Ticket className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {event.is_cancelled ? 'Ingressos Reembolsados' : 'Ingressos Vendidos'}
                                    </span>
                                </div>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {event.is_cancelled ? (
                                        <>
                                            {event.metrics.refundedTickets}
                                            <span className="text-sm text-gray-500 font-normal"> reembolsados</span>
                                        </>
                                    ) : (
                                        <>
                                            {event.metrics.soldTickets}
                                            <span className="text-sm text-gray-500 font-normal">
                                                /{event.totalTickets}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Banknote className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {event.is_cancelled ? 'Valor Reembolsado' : 'Receita'}
                                    </span>
                                </div>
                                <p className="text-2xl font-semibold text-gray-900">
                                    R$
                                    {event.is_cancelled
                                        ? event.metrics.refundedTickets * event.price
                                        : event.metrics.revenue}
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <CalendarDays className="w-4 h-4" />
                                    <span className="text-sm font-medium">Data</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(event.eventDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <InfoIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <Badge
                                    variant={event.is_cancelled ? 'destructive' : isPastEvent ? 'default' : 'success'}
                                    className="text-xs"
                                >
                                    {event.is_cancelled ? 'Cancelado' : isPastEvent ? 'Terminado' : 'Ativo'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
