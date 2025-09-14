'use client'

import { useUser } from '@clerk/nextjs'
import { useAction, useQuery } from 'convex/react'
import { Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import ReleaseTicket from './ReleaseTicket'

export default function PurchaseTicket({ eventId }: { eventId: Id<'events'> }) {
    const router = useRouter()
    const { user } = useUser()

    // Get queue position
    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
        eventId,
        userId: user?.id ?? '',
    })

    // Create checkout session action
    const createCheckoutSession = useAction(api.payment.createCheckoutSession)

    const [timeRemaining, setTimeRemaining] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0
    const isExpired = Date.now() > offerExpiresAt

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (isExpired) {
                setTimeRemaining('Expirado')
                return
            }

            const diff = offerExpiresAt - Date.now()
            const minutes = Math.floor(diff / 1000 / 60)
            const seconds = Math.floor((diff / 1000) % 60)

            if (minutes > 0) {
                setTimeRemaining(
                    `${minutes} minuto${minutes === 1 ? '' : 's'} ${seconds} segundo${seconds === 1 ? '' : 's'}`,
                )
            } else {
                setTimeRemaining(`${seconds} segundo${seconds === 1 ? '' : 's'}`)
            }
        }

        calculateTimeRemaining()
        const interval = setInterval(calculateTimeRemaining, 1000)
        return () => clearInterval(interval)
    }, [offerExpiresAt, isExpired])

    const handlePurchase = async () => {
        if (!user) return

        try {
            setIsLoading(true)
            const { sessionUrl } = await createCheckoutSession({
                eventId,
                quantity: queuePosition!.quantity,
            })

            if (sessionUrl) {
                router.push(sessionUrl)
            }
        } catch (error) {
            console.error('Error creating checkout session:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!user || !queuePosition || queuePosition.status !== 'offered') {
        return null
    }

    const ticketText = queuePosition.quantity === 1 ? 'Ingresso' : `${queuePosition.quantity} Ingressos`

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
            <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{ticketText} Reservado</h3>
                                <p className="text-sm text-gray-500">Expira em {timeRemaining}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 leading-relaxed">
                            {queuePosition.quantity === 1
                                ? 'Um ingresso foi reservado para você. Complete sua compra antes do tempo expirar para garantir sua vaga neste evento.'
                                : `${queuePosition.quantity} ingressos foram reservados para você. Complete sua compra antes do tempo expirar para garantir suas vagas neste evento.`}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handlePurchase}
                    disabled={isExpired || isLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                    {isLoading ? 'Redirecionando para checkout...' : `Comprar Seu(s) ${ticketText} Agora →`}
                </button>

                <div className="mt-4">
                    <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
                </div>
            </div>
        </div>
    )
}
