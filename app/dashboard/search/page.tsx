'use client'

import { useQuery } from 'convex/react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { api } from '@/convex/_generated/api'

import EventCard from '@/components/EventCard'
import Spinner from '@/components/Spinner'
import dayjs from '@/lib/dayjs'

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const searchResults = useQuery(api.events.search, { searchTerm: query })

    if (!searchResults) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    const today = dayjs().startOf('day')
    const upcomingEvents = searchResults
        .filter(event => dayjs(event.eventDate).isAfter(today))
        .sort((a, b) => dayjs(a.eventDate).diff(b.eventDate))

    const pastEvents = searchResults
        .filter(event => dayjs(event.eventDate).isBefore(today))
        .sort((a, b) => dayjs(b.eventDate).diff(a.eventDate))

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Results Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Search className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Resultados da Busca por &quot;{query}&quot;
                        </h1>
                        <p className="text-muted-foreground mt-1">Encontrados {searchResults.length} eventos</p>
                    </div>
                </div>

                {/* No Results State */}
                {searchResults.length === 0 && (
                    <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-card-foreground">Nenhum evento encontrado</h3>
                        <p className="text-muted-foreground mt-1">
                            Tente ajustar seus termos de busca ou navegue por todos os eventos
                        </p>
                    </div>
                )}

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-foreground mb-6">Próximos Eventos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <EventCard key={event._id} eventId={event._id} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6">Eventos Passados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastEvents.map(event => (
                                <EventCard key={event._id} eventId={event._id} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
