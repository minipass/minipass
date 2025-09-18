'use client'

import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { Clock, Minus, OctagonXIcon, Plus } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { WAITING_LIST_STATUS } from '@/convex/constants'

import { useToast } from '@/hooks/useToast'
import dayjs from '@/lib/dayjs'

import Spinner from './Spinner'

const MAX_QUANTITY = 10
const MAX_QUANTITY_HIDDEN = 10

export default function JoinQueue({ eventId, userId }: { eventId: Id<'events'>; userId: string }) {
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const joinWaitingList = useMutation(api.events.joinWaitingList)
    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
        eventId,
        userId,
    })
    const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
        eventId,
        userId,
    })
    const availability = useQuery(api.events.getEventAvailability, { eventId })
    const event = useQuery(api.events.getById, { eventId })

    const isEventOwner = userId === event?.userId

    const handleQuantityChange = (newQuantity: number) => {
        if (
            newQuantity >= 1 &&
            newQuantity <= (!availability?.availabilityHidden ? MAX_QUANTITY : MAX_QUANTITY_HIDDEN)
        ) {
            setQuantity(newQuantity)
        }
    }

    const handleJoinQueue = async () => {
        try {
            setIsLoading(true)
            const result = await joinWaitingList({ eventId, userId, quantity })
            if (result.success) {
                console.log('Successfully joined waiting list')
                toast({
                    title: 'Sucesso!',
                    description: result.message,
                })
            }
        } catch (error) {
            if (error instanceof ConvexError) {
                if (error.message.includes('joined the waiting list too many times')) {
                    toast({
                        variant: 'destructive',
                        title: 'Devagar aí!',
                        description: error.data,
                        duration: 5000,
                    })
                } else if (error.message.includes("There aren't") && error.message.includes('tickets available')) {
                    toast({
                        variant: 'destructive',
                        title: 'Ingressos insuficientes disponíveis',
                        description: error.data,
                        duration: 5000,
                    })
                } else {
                    console.error('Error joining waiting list:', error)
                    toast({
                        variant: 'destructive',
                        title: 'Ops! Algo deu errado.',
                        description: error.data || 'Falha ao entrar na fila. Tente novamente mais tarde.',
                    })
                }
            } else {
                console.error('Error joining waiting list:', error)
                toast({
                    variant: 'destructive',
                    title: 'Ops! Algo deu errado.',
                    description: 'Falha ao entrar na fila. Tente novamente mais tarde.',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (queuePosition === undefined || availability === undefined || !event) {
        return <Spinner />
    }

    if (userTicket) {
        return null
    }

    const isPastEvent = dayjs(event.eventDate).isBefore(dayjs().startOf('day'))
    const availableTickets = availability.totalTickets - availability.purchasedCount

    return (
        <div>
            {(!queuePosition ||
                queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
                (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
                    queuePosition.offerExpiresAt &&
                    queuePosition.offerExpiresAt <= Date.now())) && (
                <>
                    {isEventOwner ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-muted text-muted-foreground rounded-sm">
                            <OctagonXIcon className="w-5 h-5" />
                            <span>Você não pode comprar um ingresso para seu próprio evento</span>
                        </div>
                    ) : isPastEvent ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-muted text-muted-foreground rounded-sm cursor-not-allowed">
                            <Clock className="w-5 h-5" />
                            <span>Evento terminou</span>
                        </div>
                    ) : availability.isSoldOut ? (
                        <div className="text-center p-4">
                            <p className="text-lg font-semibold text-destructive">
                                Desculpe, este evento está esgotado
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Quantity Selector */}
                            <div className="bg-gray-50 p-4 rounded-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Número de Ingressos</label>
                                    {!availability.availabilityHidden && (
                                        <span className="text-sm text-muted-foreground">
                                            {availableTickets} disponíveis
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="w-8 h-8 rounded-sm bg-background border border-border flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-lg font-semibold px-4">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={
                                            quantity >=
                                            (!availability.availabilityHidden
                                                ? Math.min(MAX_QUANTITY, availableTickets)
                                                : MAX_QUANTITY_HIDDEN)
                                        }
                                        className="w-8 h-8 rounded-sm bg-background border border-border flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    Total: R$ {(event.price * quantity).toFixed(2)}
                                </div>
                            </div>

                            <button
                                onClick={handleJoinQueue}
                                disabled={isPastEvent || isEventOwner || isLoading}
                                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Spinner /> : `Comprar ${quantity} Ingresso${quantity > 1 ? 's' : ''}`}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
