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
import { Button } from '@/components/ui/button'
import { useStorageUrl } from '@/hooks/useStorageUrl'

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

    if (!event || !availability) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {imageUrl && (
                        <div className="aspect-[3/1] relative w-full">
                            <Image src={imageUrl} alt={event.name} fill className="object-cover" priority />
                        </div>
                    )}

                    <div className="flex flex-col p-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
                            <p className="text-lg text-gray-600 mb-8">{event.description}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column - Event Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Event Information - Less Card-Centric Design */}
                                <div className="bg-white border border-gray-200 rounded-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Evento</h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center py-3">
                                            <CalendarDays className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Data</span>
                                                <p className="text-gray-900 font-medium">
                                                    {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center py-3 border-t border-gray-100">
                                            <MapPin className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Local</span>
                                                <p className="text-gray-900 font-medium">{event.location}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center py-3 border-t border-gray-100">
                                            <Ticket className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Preço</span>
                                                <p className="text-gray-900 font-medium">R$ {event.price.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {!availability.availabilityHidden && (
                                            <div className="flex items-center py-3 border-t border-gray-100">
                                                <Users className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Disponibilidade
                                                    </span>
                                                    <p className="text-gray-900 font-medium">
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
                                    <div className="bg-green-50 border border-green-200 rounded-sm p-6">
                                        <div className="flex items-center mb-4">
                                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                                            <h3 className="text-lg font-semibold text-green-900">
                                                Seus Ingressos ({currentUserTickets.length})
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            {currentUserTickets.map((ticket, index) => (
                                                <div
                                                    key={ticket._id}
                                                    className="bg-white rounded-sm p-4 border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
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
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Ingresso {index + 1} de {currentUserTickets.length}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            R$ {event.price.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                                            Clique para ampliar
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-sm text-green-700">
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
                                <div className="bg-blue-50 border border-blue-100 rounded-sm p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Informações Extras</h3>
                                    <ul className="space-y-2 text-blue-700">
                                        <li>• Por favor, chegue 30 minutos antes do evento começar</li>
                                        <li>• Ingressos não são reembolsáveis</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column - Purchase Section */}
                            <div>
                                <div className="sticky top-8">
                                    <div className="bg-white border border-gray-200 rounded-sm p-8">
                                        <div className="text-center mb-8">
                                            <div className="text-4xl font-bold text-gray-900 mb-3">
                                                R$ {event.price.toFixed(2)}
                                            </div>
                                            {!availability.availabilityHidden && (
                                                <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
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
                                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-4 px-6 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg text-lg">
                                                        Entrar para comprar ingressos
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
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedQRCode.eventName}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Ingresso {selectedQRCode.ticketNumber} de {selectedQRCode.totalTickets}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedQRCode(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-6 rounded-sm border border-gray-200">
                                <QRCode value={selectedQRCode.ticketId} className="w-64 h-64" />
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">ID do Ingresso</p>
                            <p className="text-xs text-gray-400 break-all font-mono bg-gray-50 p-2 rounded">
                                {selectedQRCode.ticketId}
                            </p>
                            <p className="text-sm text-gray-600 mt-3">R$ {selectedQRCode.price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
