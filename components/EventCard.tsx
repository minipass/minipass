'use client'

import { useUser } from '@clerk/nextjs'
import { Authenticated, useQuery } from 'convex/react'
import {
    CalendarDays,
    Check,
    CircleArrowRight,
    LoaderCircle,
    MapPin,
    PencilIcon,
    StarIcon,
    Ticket,
    XCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { useStorageUrl } from '@/hooks/useStorageUrl'
import { cn } from '@/lib/css'

import PurchaseTicket from './PurchaseTicket'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function EventCard({ eventId }: { eventId: Id<'events'> }) {
    const { user } = useUser()
    const router = useRouter()
    const event = useQuery(api.events.getById, { eventId })
    const availability = useQuery(api.events.getEventAvailability, { eventId })
    const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
        eventId,
        userId: user?.id ?? '',
    })
    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
        eventId,
        userId: user?.id ?? '',
    })
    const imageUrl = useStorageUrl(event?.imageStorageId)

    if (!event || !availability) {
        return null
    }

    const isPastEvent = event.eventDate < Date.now()

    const isEventOwner = user?.id === event?.userId

    const renderQueuePosition = () => {
        if (!queuePosition || queuePosition.status !== 'waiting') return null

        if (availability.purchasedCount >= availability.totalTickets) {
            return (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <Ticket className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Evento esgotado</span>
                    </div>
                </div>
            )
        }

        if (queuePosition.position === 2) {
            return (
                <div className="flex flex-col lg:flex-row items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center">
                        <CircleArrowRight className="w-5 h-5 text-amber-600 mr-2" />
                        <span className="text-amber-800 font-medium">
                            Você é o próximo na fila! (Posição na fila: {queuePosition.position})
                        </span>
                    </div>
                    <div className="flex items-center">
                        <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-600" />
                        <span className="text-amber-700 text-sm">Aguardando ingresso</span>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-200">
                <div className="flex items-center">
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-sky-600" />
                    <span className="text-sky-800 font-medium">Posição na fila</span>
                </div>
                <Badge variant="info" className="font-medium">
                    #{queuePosition.position}
                </Badge>
            </div>
        )
    }

    const renderTicketStatus = () => {
        if (!user) return null

        if (isEventOwner) {
            return (
                <div className="mt-4">
                    <Button
                        variant="secondary"
                        onClick={e => {
                            e.stopPropagation()
                            router.push(`/seller/events/${eventId}/edit`)
                        }}
                        className="w-full"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Editar Evento
                    </Button>
                </div>
            )
        }

        if (userTicket) {
            return (
                <div className="mt-4 flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center">
                        <Check className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="text-emerald-800 font-medium">Você tem ingressos para este evento!</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => router.push('/tickets')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Ver seus ingressos
                    </Button>
                </div>
            )
        }

        if (queuePosition) {
            return (
                <Authenticated>
                    <div className="mt-4">
                        {queuePosition.status === 'offered' && <PurchaseTicket eventId={eventId} />}
                        {renderQueuePosition()}
                        {queuePosition.status === 'expired' && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <span className="text-red-800 font-medium flex items-center">
                                    <XCircle className="w-5 h-5 mr-2" />
                                    Oferta expirada
                                </span>
                            </div>
                        )}
                    </div>
                </Authenticated>
            )
        }

        return null
    }

    return (
        <Card
            onClick={() => router.push(`/event/${eventId}`)}
            className={cn(
                'cursor-pointer overflow-hidden relative hover:border-gray-300 hover:shadow-sm transition-all duration-200',
                isPastEvent && 'opacity-75 hover:opacity-100',
            )}
        >
            {/* Event Image */}
            {imageUrl && (
                <div className="relative w-full h-48">
                    <Image src={imageUrl} alt={event.name} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}

            <div className={cn('p-6', imageUrl && 'relative')}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex flex-col items-start gap-2">
                            {isEventOwner && (
                                <Badge variant="secondary" className="bg-blue-600 text-white border-blue-600">
                                    <StarIcon className="w-3 h-3 mr-1" />
                                    Seu Evento
                                </Badge>
                            )}
                            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                        </div>
                        {isPastEvent && (
                            <Badge variant="default" className="mt-2">
                                Evento Passado
                            </Badge>
                        )}
                    </div>

                    {/* Price Tag */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge
                            variant={isPastEvent ? 'default' : 'success'}
                            className="px-4 py-1.5 text-base font-semibold"
                        >
                            R${event.price.toFixed(2)}
                        </Badge>
                        {availability.purchasedCount >= availability.totalTickets && (
                            <Badge variant="destructive" className="px-4 py-1.5 text-sm font-semibold">
                                Esgotado
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <span>
                            {new Date(event.eventDate).toLocaleDateString()} {isPastEvent && '(Terminado)'}
                        </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <Ticket className="w-4 h-4 mr-2" />
                        <span>
                            {availability.totalTickets - availability.purchasedCount} / {availability.totalTickets}{' '}
                            disponíveis
                            {!isPastEvent && availability.activeOffers > 0 && (
                                <span className="text-amber-600 text-sm ml-2">
                                    ({availability.activeOffers}{' '}
                                    {availability.activeOffers === 1 ? 'pessoa' : 'pessoas'} tentando comprar)
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <p className="mt-4 text-gray-600 text-sm line-clamp-2">{event.description}</p>

                <div onClick={e => e.stopPropagation()}>{!isPastEvent && renderTicketStatus()}</div>
            </div>
        </Card>
    )
}
