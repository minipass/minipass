'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { ArrowRight, CalendarDays, CheckCircle, MapPin, Ticket } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useStorageUrl } from '@/hooks/useStorageUrl'
import { cn } from '@/lib/css'

export default function MyTicketsPage() {
    const { user } = useUser()
    const searchParams = useSearchParams()
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const groupedTickets = useQuery(api.events.getUserTicketsGroupedByEvent, {
        userId: user?.id ?? '',
    })

    // Check if user was redirected from a successful purchase
    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setShowSuccessMessage(true)
            // Hide the message after 5 seconds
            const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [searchParams])

    if (!groupedTickets) return null

    // Separate valid and other tickets
    const validGroupedTickets = groupedTickets.filter(group => group.tickets.some(ticket => ticket.status === 'valid'))
    const otherGroupedTickets = groupedTickets.filter(group => group.tickets.every(ticket => ticket.status !== 'valid'))

    // Separate upcoming and past events
    const upcomingGroupedTickets = validGroupedTickets.filter(group => group.event.eventDate > Date.now())
    const pastGroupedTickets = validGroupedTickets.filter(group => group.event.eventDate <= Date.now())

    // Get total ticket count
    const totalTickets = groupedTickets.reduce((total, group) => total + group.tickets.length, 0)

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-sm p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-emerald-800">Compra Realizada com Sucesso!</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Seus ingressos foram confirmados e estão prontos para uso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Meus Ingressos</h1>
                        <p className="mt-2 text-muted-foreground">
                            Gerencie e visualize todos os seus ingressos em um só lugar
                        </p>
                    </div>
                    <Card className="px-4 py-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Ticket className="w-5 h-5" />
                            <span className="font-medium">{totalTickets} Ingressos Totais</span>
                        </div>
                    </Card>
                </div>

                {upcomingGroupedTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Eventos</h2>
                        <div className="space-y-4">
                            {upcomingGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {pastGroupedTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Eventos Passados</h2>
                        <div className="space-y-4">
                            {pastGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {otherGroupedTickets.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">Outros Ingressos</h2>
                        <div className="space-y-4">
                            {otherGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {groupedTickets.length === 0 && (
                    <div className="text-center py-12">
                        <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">Nenhum ingresso ainda</h3>
                        <p className="text-muted-foreground mt-1">
                            Quando você comprar ingressos, eles aparecerão aqui
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Event Card Component
function EventCard({ group }: { group: { event: any; tickets: any[] } }) {
    const imageUrl = useStorageUrl(group.event.imageStorageId)
    const isPastEvent = group.event.eventDate < Date.now()

    return (
        <Link href={`/event/${group.event._id}`}>
            <Card
                className={cn(
                    'hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden',
                    isPastEvent && 'opacity-75 hover:opacity-100',
                )}
            >
                <div className="flex">
                    {/* Event Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                            src={imageUrl || '/images/event-fallback.svg'}
                            alt={group.event.name}
                            fill
                            unoptimized // TODO: Eventually remove this, need it for now because of Convex
                            className={cn('w-full h-full object-cover', group.event.isCancelled && 'opacity-50')}
                        />
                        {group.event.isCancelled && (
                            <div className="absolute inset-0 bg-destructive bg-opacity-75 flex items-center justify-center">
                                <Badge variant="destructive" className="text-xs">
                                    Cancelado
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">{group.event.name}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                    <div className="flex items-center text-muted-foreground">
                                        <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                                        <span className="text-sm">
                                            {new Date(group.event.eventDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                        <span className="text-sm">{group.event.location}</span>
                                    </div>

                                    <div className="flex items-center text-muted-foreground">
                                        <Ticket className="w-4 h-4 mr-2 text-primary" />
                                        <span className="text-sm">
                                            {group.tickets.length} ingresso{group.tickets.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total pago: R$ {(group.event.price * group.tickets.length).toFixed(2)}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
