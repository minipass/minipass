'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { CalendarDays, CheckCircle, MapPin, Ticket, Users, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import JoinQueue from '@/components/JoinQueue'
import Spinner from '@/components/Spinner'
import { Editor } from '@/components/tiptap/Editor'
import { Button } from '@/components/ui/button'
import { useStorageUrl } from '@/hooks/useStorageUrl'
import dayjs, { LONG_FORMAT } from '@/lib/dayjs'

export default function EventPage() {
    const { user } = useUser()
    const params = useParams()
    const [selectedQRCode, setSelectedQRCode] = useState<{
        ticketId: string
        eventName: string
        ticketNumber: number
        totalTickets: number
        price: number
    } | null>(null)

    const event = useQuery(api.events.getById, {
        eventId: params.id as Id<'events'>,
    })
    const availability = useQuery(api.events.getEventAvailability, {
        eventId: params.id as Id<'events'>,
    })
    const userTickets = useQuery(api.tickets.getValidTicketsForEvent, {
        eventId: params.id as Id<'events'>,
    })
    const imageUrl = useStorageUrl(event?.imageStorageId)

    // Filter tickets to only show the current user's tickets
    const currentUserTickets = userTickets?.filter(ticket => ticket.userId === user?.id) || []

    // Close modal when Escape key is pressed
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedQRCode(null)
            }
        }

        if (selectedQRCode) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [selectedQRCode])

    console.log(event, availability, imageUrl)
    if (!event || !availability) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-[3/1] relative w-full">
                        <Image
                            src={imageUrl || '/images/event-fallback.svg'}
                            alt={event.name}
                            fill
                            unoptimized // TODO: Eventually remove this, need it for now because of Convex
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="flex flex-col p-8">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-4">{event.name}</h1>
                            <p className="text-lg text-muted-foreground mb-8">{event.callout}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column - Event Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Event Information - Less Card-Centric Design */}
                                <div className="bg-card border border-border rounded-sm p-6">
                                    <h2 className="text-xl font-semibold text-card-foreground mb-6">
                                        Informações do Evento
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center py-3">
                                            <CalendarDays className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Horário
                                                </span>
                                                <p className="text-foreground font-medium">
                                                    {dayjs(event.eventDate).format(LONG_FORMAT)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center py-3 border-t border-gray-100">
                                            <MapPin className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Local</span>
                                                <p className="text-foreground font-medium">{event.location}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center py-3 border-t border-gray-100">
                                            <Ticket className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Preço</span>
                                                <p className="text-foreground font-medium">
                                                    R$ {event.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {!availability.availabilityHidden && (
                                            <div className="flex items-center py-3 border-t border-gray-100">
                                                <Users className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Disponibilidade
                                                    </span>
                                                    <p className="text-foreground font-medium">
                                                        {availability.totalTickets - availability.purchasedCount} de{' '}
                                                        {availability.totalTickets} ingressos restantes
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* User's Tickets Section */}
                                {currentUserTickets.length > 0 && (
                                    <div className="bg-primary/10 border border-primary/20 text-primary rounded-sm p-6">
                                        <div className="flex items-center mb-4">
                                            <CheckCircle className="w-6 h-6 mr-3" />
                                            <h3 className="text-lg font-semibold">
                                                Seus Ingressos ({currentUserTickets.length})
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            {currentUserTickets.map((ticket, index) => (
                                                <div
                                                    key={ticket._id}
                                                    className="bg-card rounded-sm p-4 border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedQRCode({
                                                            ticketId: ticket._id,
                                                            eventName: event.name,
                                                            ticketNumber: index + 1,
                                                            totalTickets: currentUserTickets.length,
                                                            price: event.price,
                                                        })
                                                    }
                                                >
                                                    <div className="text-center">
                                                        <div className="bg-gray-50 p-2 rounded-sm inline-block mb-3">
                                                            <QRCode value={ticket._id} className="w-20 h-20" />
                                                        </div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            Ingresso {index + 1} de {currentUserTickets.length}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            R$ {event.price.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                                            Clique para ampliar
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-sm ">
                                            <p className="font-medium mb-2">Importante:</p>
                                            <ul className="space-y-1">
                                                <li>• Tenha seus códigos QR prontos para escaneamento</li>
                                                <li>• Cada ingresso não é transferível</li>
                                                <li>• Você pode usar qualquer um dos seus ingressos para entrada</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Event Information */}
                                <div className="bg-primary/10 border border-primary/20 rounded-sm p-6">
                                    <h3 className="text-lg font-semibold text-primary mb-2">
                                        Informações do Organizador
                                    </h3>
                                    <Editor content={event.description} editable={false} />
                                </div>
                            </div>

                            {/* Right Column - Purchase Section */}
                            <div>
                                <div className="sticky top-8">
                                    <div className="bg-card border border-border rounded-sm p-8">
                                        <div className="text-center mb-8">
                                            <div className="text-4xl font-bold text-card-foreground mb-3">
                                                R$ {event.price.toFixed(2)}
                                            </div>
                                            {!availability.availabilityHidden && (
                                                <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    <span>
                                                        {availability.totalTickets - availability.purchasedCount} de{' '}
                                                        {availability.totalTickets} ingressos restantes
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {user ? (
                                                <JoinQueue eventId={params.id as Id<'events'>} userId={user.id} />
                                            ) : (
                                                <Link href="/sign-in">
                                                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/40 text-primary-foreground font-medium py-4 px-6 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg text-lg">
                                                        Comprar Ingressos
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {selectedQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-card-foreground">{selectedQRCode.eventName}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ingresso {selectedQRCode.ticketNumber} de {selectedQRCode.totalTickets}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedQRCode(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="bg-card p-6 rounded-sm border border-border">
                                <QRCode value={selectedQRCode.ticketId} className="w-64 h-64" />
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">ID do Ingresso</p>
                            <p className="text-xs text-muted-foreground break-all font-mono bg-muted p-2 rounded">
                                {selectedQRCode.ticketId}
                            </p>
                            <p className="text-sm text-muted-foreground mt-3">R$ {selectedQRCode.price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
