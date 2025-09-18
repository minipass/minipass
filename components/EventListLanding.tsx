'use client'

import { useQuery } from 'convex/react'
import { Ticket } from 'lucide-react'

import { api } from '@/convex/_generated/api'

import dayjs from '@/lib/dayjs'

import EventCard from './EventCard'
import Spinner from './Spinner'

export default function EventListLanding() {
    const events = useQuery(api.events.get)

    if (!events) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    const today = dayjs().startOf('day')
    const upcomingEvents = events
        .filter(event => dayjs(event.eventDate).isAfter(today))
        .sort((a, b) => dayjs(a.eventDate).diff(b.eventDate))

    return (
        <div className="">
            {/* Upcoming Events Grid */}
            {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map(event => (
                        <EventCard key={event._id} eventId={event._id} />
                    ))}
                </div>
            ) : (
                <div className="bg-secondary rounded-sm p-12 text-center">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Nenhum evento próximo</h3>
                    <p className="text-muted-foreground mt-1">Volte mais tarde para novos eventos</p>
                </div>
            )}
        </div>
    )
}
