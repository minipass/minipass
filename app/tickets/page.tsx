'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { ArrowRight, CalendarDays, CheckCircle, MapPin, Ticket } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'

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
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-green-800">Compra Realizada com Sucesso!</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Seus ingressos foram confirmados e estão prontos para uso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meus Ingressos</h1>
                        <p className="mt-2 text-gray-600">
                            Gerencie e visualize todos os seus ingressos em um só lugar
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Ticket className="w-5 h-5" />
                            <span className="font-medium">{totalTickets} Ingressos Totais</span>
                        </div>
                    </div>
                </div>

                {upcomingGroupedTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
                        <div className="space-y-4">
                            {upcomingGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {pastGroupedTickets.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventos Passados</h2>
                        <div className="space-y-4">
                            {pastGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {otherGroupedTickets.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Outros Ingressos</h2>
                        <div className="space-y-4">
                            {otherGroupedTickets.map(group => (
                                <EventCard key={group.event._id} group={group} />
                            ))}
                        </div>
                    </div>
                )}

                {groupedTickets.length === 0 && (
                    <div className="text-center py-12">
                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum ingresso ainda</h3>
                        <p className="text-gray-600 mt-1">Quando você comprar ingressos, eles aparecerão aqui</p>
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
            <div
                className={cn(
                    'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden',
                    isPastEvent && 'opacity-75 hover:opacity-100',
                )}
            >
                <div className="flex">
                    {/* Event Image */}
                    {imageUrl && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={group.event.name}
                                className={cn('w-full h-full object-cover', group.event.is_cancelled && 'opacity-50')}
                            />
                            {group.event.is_cancelled && (
                                <div className="absolute inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">Cancelado</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.event.name}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                    <div className="flex items-center text-gray-600">
                                        <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-sm">
                                            {new Date(group.event.eventDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-sm">{group.event.location}</span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <Ticket className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-sm">
                                            {group.tickets.length} ingresso{group.tickets.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Total pago: R$ {(group.event.price * group.tickets.length).toFixed(2)}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
