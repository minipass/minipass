'use client'

import { useQuery } from 'convex/react'
import { CalendarDays, IdCard, MapPin, Ticket as TicketIcon, User } from 'lucide-react'
import Image from 'next/image'
import QRCode from 'react-qr-code'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { useStorageUrl } from '@/hooks/useStorageUrl'
import { cn } from '@/lib/css'

import Spinner from './Spinner'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

export default function Ticket({ ticketId }: { ticketId: Id<'tickets'> }) {
    const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId })
    const user = useQuery(api.users.getUserById, {
        userId: ticket?.userId ?? '',
    })
    const imageUrl = useStorageUrl(ticket?.event?.imageStorageId)

    if (!ticket || !ticket.event || !user) {
        return <Spinner />
    }

    return (
        <Card className={cn('overflow-hidden', ticket.event.isCancelled ? 'border-destructive/20' : '')}>
            {/* Event Header with Image */}
            <div className="relative">
                <div className="relative w-full aspect-[21/9] ">
                    <Image
                        src={imageUrl || '/images/event-fallback.svg'}
                        alt={ticket.event.name}
                        fill
                        className={cn('object-cover object-center', ticket.event.isCancelled && 'opacity-50')}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
                </div>
                <div className="px-6 py-4 absolute bottom-0 left-0 right-0">
                    <h2 className="text-2xl font-bold text-white">{ticket.event.name}</h2>
                    {ticket.event.isCancelled && <p className="text-destructive/80 mt-1">Este evento foi cancelado</p>}
                </div>
            </div>

            {/* Ticket Content */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Event Details */}
                    <div className="space-y-4">
                        <div className="flex items-center text-muted-foreground">
                            <CalendarDays
                                className={cn(
                                    'w-5 h-5 mr-3',
                                    ticket.event.isCancelled ? 'text-destructive' : 'text-primary',
                                )}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">Data</p>
                                <p className="font-medium">{new Date(ticket.event.eventDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <MapPin
                                className={cn(
                                    'w-5 h-5 mr-3',
                                    ticket.event.isCancelled ? 'text-destructive' : 'text-primary',
                                )}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">Local</p>
                                <p className="font-medium">{ticket.event.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <User
                                className={cn(
                                    'w-5 h-5 mr-3',
                                    ticket.event.isCancelled ? 'text-destructive' : 'text-primary',
                                )}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">Portador do Ingresso</p>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground break-all">
                            <IdCard
                                className={cn(
                                    'w-5 h-5 mr-3',
                                    ticket.event.isCancelled ? 'text-destructive' : 'text-primary',
                                )}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">ID do Portador</p>
                                <p className="font-medium">{user.userId}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <TicketIcon
                                className={cn(
                                    'w-5 h-5 mr-3',
                                    ticket.event.isCancelled ? 'text-destructive' : 'text-primary',
                                )}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">Preço do Ingresso</p>
                                <p className="font-medium">R${ticket.event.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - QR Code */}
                    <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-6">
                        <div
                            className={cn(
                                'bg-gray-50 border border-gray-200 p-4 rounded-sm',
                                ticket.event.isCancelled && 'opacity-50',
                            )}
                        >
                            <QRCode value={ticket._id} className="w-32 h-32" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground break-all text-center max-w-[200px] md:max-w-full">
                            ID do Ingresso: {ticket._id}
                        </p>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-foreground mb-2">Informações Importantes</h3>
                    {ticket.event.isCancelled ? (
                        <p className="text-sm text-destructive">
                            Este evento foi cancelado. Um reembolso será processado se ainda não foi feito.
                        </p>
                    ) : (
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Por favor, chegue pelo menos 30 minutos antes do evento</li>
                            <li>• Tenha seu código QR do ingresso pronto para escaneamento</li>
                            <li>• Este ingresso não é transferível</li>
                        </ul>
                    )}
                </div>
            </div>

            {/* Ticket Footer */}
            <div
                className={cn(
                    'px-6 py-4 flex justify-between items-center border-t border-gray-200',
                    ticket.event.isCancelled ? 'bg-destructive/10' : 'bg-muted',
                )}
            >
                <span className="text-sm text-muted-foreground">
                    Data da Compra: {new Date(ticket.purchasedAt).toLocaleString()}
                </span>
                <Badge variant={ticket.event.isCancelled ? 'destructive' : 'primary'}>
                    {ticket.event.isCancelled ? 'Cancelado' : 'Ingresso Válido'}
                </Badge>
            </div>
        </Card>
    )
}
