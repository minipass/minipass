'use client'

import { useAction, useMutation, useQuery } from 'convex/react'
import { Ban } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { useToast } from '@/hooks/useToast'

export default function CancelEventButton({ eventId }: { eventId: Id<'events'> }) {
    const [isCancelling, setIsCancelling] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const cancelEvent = useMutation(api.events.cancelEvent)
    const processRefunds = useAction(api.payment.processRefunds)

    // Get event details and event owner accounts
    const event = useQuery(api.events.getById, { eventId })

    const handleCancel = async () => {
        if (
            !confirm(
                'Tem certeza de que deseja cancelar este evento? Todos os ingressos serão reembolsados e o evento será cancelado permanentemente.',
            )
        ) {
            return
        }

        if (!event) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível carregar os detalhes do evento. Tente novamente.',
            })
            return
        }

        setIsCancelling(true)
        try {
            await processRefunds({ eventId })
            await cancelEvent({ eventId })

            toast({
                title: 'Evento cancelado',
                description: 'Todos os ingressos foram reembolsados com sucesso.',
            })
            router.push('/seller/events')
        } catch (error) {
            console.error('Failed to cancel event:', error)
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao cancelar evento. Tente novamente.',
            })
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
        >
            <Ban className="w-4 h-4" />
            <span>{isCancelling ? 'Processando...' : 'Cancelar Evento'}</span>
        </button>
    )
}
