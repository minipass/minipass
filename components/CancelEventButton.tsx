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
                'Are you sure you want to cancel this event? All tickets will be refunded and the event will be cancelled permanently.',
            )
        ) {
            return
        }

        if (!event) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Unable to load event details. Please try again.',
            })
            return
        }

        setIsCancelling(true)
        try {
            await processRefunds({ eventId })
            await cancelEvent({ eventId })

            toast({
                title: 'Event cancelled',
                description: 'All tickets have been refunded successfully.',
            })
            router.push('/seller/events')
        } catch (error) {
            console.error('Failed to cancel event:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to cancel event. Please try again.',
            })
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
            <Ban className="w-4 h-4" />
            <span>{isCancelling ? 'Processing...' : 'Cancel Event'}</span>
        </button>
    )
}
