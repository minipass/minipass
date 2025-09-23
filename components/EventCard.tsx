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
import dayjs from '@/lib/dayjs'

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

    const isPastEvent = dayjs(event.eventDate).isBefore(dayjs().startOf('day'))
    const isEventOwner = user?.id === event?.userId

    const renderQueuePosition = () => {
        if (!queuePosition || queuePosition.status !== 'waiting') return null

        if (!availability.availabilityHidden && availability.purchasedCount >= availability.totalTickets) {
            return (
                <div className="flex items-center justify-between p-4 bg-muted rounded-sm border">
                    <div className="flex items-center">
                        <Ticket className="w-5 h-5 text-muted-foreground mr-2" />
                        <span className="text-foreground font-medium">Evento esgotado</span>
                    </div>
                </div>
            )
        }

        if (queuePosition.position === 2) {
            return (
                <div className="flex flex-col lg:flex-row items-center justify-between p-4 bg-amber-50 rounded-sm border border-amber-200">
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
            <div className="flex items-center justify-between p-4 bg-sky-50 rounded-sm border border-sky-200">
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
                            router.push(`/dashboard/seller/events/${eventId}/edit`)
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
                <div className="mt-4 flex items-center justify-between p-4 bg-emerald-50 rounded-sm border border-emerald-200">
                    <div className="flex items-center">
                        <Check className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="text-emerald-800 font-medium">Você tem ingressos para este evento!</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => router.push('/dashboard/tickets')}
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
                            <div className="p-4 bg-destructive/10 rounded-sm border border-destructive/20">
                                <span className="text-destructive font-medium flex items-center">
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
            onClick={() => router.push(`/dashboard/event/${eventId}`)}
            className={cn(
                'cursor-pointer overflow-hidden relative transition-all duration-200',
                isPastEvent && 'opacity-75 hover:opacity-100',
            )}
        >
            {/* Event Image */}
            <div className="relative w-full h-48">
                <Image
                    src={imageUrl || '/images/event-fallback.svg'}
                    alt={event.name}
                    fill
                    unoptimized // TODO: Eventually remove this, need it for now because of Convex
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="p-6 relative">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex flex-col items-start gap-2">
                            {isEventOwner && (
                                <Badge
                                    variant="secondary"
                                    className="bg-primary text-primary-foreground border-primary"
                                >
                                    <StarIcon className="w-3 h-3 mr-1" />
                                    Seu Evento
                                </Badge>
                            )}
                            <h2 className="text-2xl font-bold text-foreground">{event.name}</h2>
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
                            variant={isPastEvent ? 'default' : 'primary'}
                            className="px-4 py-1.5 text-base font-semibold"
                        >
                            R${event.price.toFixed(2)}
                        </Badge>
                        {!availability.availabilityHidden &&
                            availability.purchasedCount >= availability.totalTickets && (
                                <Badge variant="destructive" className="px-4 py-1.5 text-sm font-semibold">
                                    Esgotado
                                </Badge>
                            )}
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center text-primary">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-primary">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <span>
                            {dayjs(event.eventDate).format('DD/MM/YYYY h:mm')} {isPastEvent && '(Terminado)'}
                        </span>
                    </div>

                    {!availability.availabilityHidden && (
                        <div className="flex items-center text-primary">
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
                    )}
                </div>

                <p className="mt-4 text-primary text-sm line-clamp-2">{event.callout}</p>

                <div onClick={e => e.stopPropagation()}>{!isPastEvent && renderTicketStatus()}</div>
            </div>
        </Card>
    )
}
