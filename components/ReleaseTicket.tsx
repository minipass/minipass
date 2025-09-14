'use client'

import { useMutation } from 'convex/react'
import { XCircle } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function ReleaseTicket({
    eventId,
    waitingListId,
}: {
    eventId: Id<'events'>
    waitingListId: Id<'waitingList'>
}) {
    const [isReleasing, setIsReleasing] = useState(false)
    const releaseTicket = useMutation(api.waitingList.releaseTicket)

    const handleRelease = async () => {
        if (!confirm('Tem certeza de que deseja liberar sua oferta de ingresso?')) return

        try {
            setIsReleasing(true)
            await releaseTicket({
                eventId,
                waitingListId,
            })
        } catch (error) {
            console.error('Error releasing ticket:', error)
        } finally {
            setIsReleasing(false)
        }
    }

    return (
        <button
            onClick={handleRelease}
            disabled={isReleasing}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-destructive/10 text-destructive rounded-sm hover:bg-destructive/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <XCircle className="w-4 h-4" />
            {isReleasing ? 'Liberando...' : 'Liberar Oferta de Ingresso'}
        </button>
    )
}
