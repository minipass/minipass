'use client'

import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { CheckCircle, Download, QrCode, Users, XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import QRCodeReader from '@/components/QRCodeReader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'

export default function EventScannerPage() {
    const { user, isLoaded } = useUser()
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as Id<'events'>

    const [validTicketIds, setValidTicketIds] = useState<Set<string>>(new Set())
    const [scannedTickets, setScannedTickets] = useState<Map<string, boolean>>(new Map())
    const [isScannerActive, setIsScannerActive] = useState(false)

    const { toast } = useToast()

    // Get event details
    const event = useQuery(api.events.getById, { eventId })

    // Check if user owns the event
    const ownsEvent = useQuery(api.tickets.checkEventOwnership, event ? { eventId } : 'skip')

    // Get valid tickets for scanning (only if user owns the event)
    const validTickets = useQuery(api.tickets.getValidTicketsForScanner, event && ownsEvent ? { eventId } : 'skip')

    // Mutation to mark ticket as used
    const markTicketAsUsed = useMutation(api.tickets.consumeTicket)

    // Update valid ticket IDs when valid tickets are loaded
    useEffect(() => {
        if (validTickets) {
            const ticketIds = new Set(validTickets.map(t => t._id))
            setValidTicketIds(ticketIds)
        }
    }, [validTickets])

    const handleTicketScanned = (scannedTicketId: string, isValid: boolean) => {
        setScannedTickets(prev => new Map(prev.set(scannedTicketId, isValid)))
    }

    const handleConsumeTicket = async (scannedTicketId: string) => {
        try {
            await markTicketAsUsed({
                ticketId: scannedTicketId as Id<'tickets'>,
            })

            // Remove from valid tickets set
            setValidTicketIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(scannedTicketId)
                return newSet
            })

            toast({
                title: 'Ingresso Consumido',
                description: 'O ingresso foi marcado como utilizado com sucesso.',
            })
        } catch (error) {
            console.error('Error consuming ticket:', error)
            toast({
                title: 'Erro',
                description: 'Falha ao marcar ingresso como utilizado.',
                variant: 'destructive',
            })
            throw error
        }
    }

    const downloadValidTickets = () => {
        if (!validTickets || !event) return

        // Create CSV header
        const csvHeader = 'ID Ticket,Id usuário,Data de compra,Status\n'

        // Create CSV rows
        const csvRows = validTickets
            .map(t => {
                const purchasedAt = new Date(t.purchasedAt).toLocaleString('pt-BR')
                return `${t._id},${t.userId},"${purchasedAt}",${t.status}`
            })
            .join('\n')

        // Combine header and rows
        const csvContent = csvHeader + csvRows

        // Create and download CSV file
        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `valid-tickets-${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
            title: 'Download Concluído',
            description: `Lista de ingressos válidos baixada para ${event.name}`,
        })
    }

    // Show loading while user is being loaded
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        router.push('/sign-in')
        return null
    }

    // Redirect if event doesn't exist or user doesn't own it
    if (event && ownsEvent === false) {
        router.push('/dashboard/seller/events')
        return null
    }

    // Show loading while event is being fetched
    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando evento...</p>
                </div>
            </div>
        )
    }

    const validTicketsCount = validTickets?.length || 0
    const scannedCount = scannedTickets.size
    const validScannedCount = Array.from(scannedTickets.values()).filter(Boolean).length

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Scanner de Ingressos</h1>
                    <p className="text-gray-600 mt-2">
                        Valide ingressos para: <strong>{event.name}</strong>
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    Voltar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Info */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Informações do Evento
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">{event.name}</h3>
                            <p className="text-sm text-gray-600">{event.location}</p>
                            <p className="text-sm text-gray-600">
                                {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Ingressos Válidos:</span>
                                <Badge variant="outline">{validTicketsCount}</Badge>
                            </div>

                            <Button
                                onClick={downloadValidTickets}
                                variant="outline"
                                className="w-full"
                                disabled={validTicketsCount === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Lista de Ingressos
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Scanner Stats */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <QrCode className="h-5 w-5 mr-2" />
                        Estatísticas
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Escaneados:</span>
                            <Badge variant="secondary">{scannedCount}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Válidos:</span>
                            <Badge variant="default" className="bg-green-500">
                                {validScannedCount}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Inválidos:</span>
                            <Badge variant="destructive">{scannedCount - validScannedCount}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Restantes:</span>
                            <Badge variant="outline">{validTicketsCount - validScannedCount}</Badge>
                        </div>
                    </div>
                </Card>

                {/* Scanner Control */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Controle do Scanner</h2>

                    <div className="space-y-4">
                        <Button
                            onClick={() => setIsScannerActive(!isScannerActive)}
                            variant={isScannerActive ? 'destructive' : 'default'}
                            className="w-full"
                        >
                            {isScannerActive ? 'Parar Scanner' : 'Iniciar Scanner'}
                        </Button>

                        {validTicketsCount === 0 && (
                            <p className="text-sm text-gray-500 text-center">
                                Nenhum ingresso válido encontrado para este evento
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* QR Code Scanner */}
            {isScannerActive && (
                <Card className="p-6">
                    <QRCodeReader
                        validTicketIds={validTicketIds}
                        onTicketScanned={handleTicketScanned}
                        onConsumeTicket={handleConsumeTicket}
                        eventName={event.name}
                    />
                </Card>
            )}

            {/* Recent Scans */}
            {scannedTickets.size > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Últimos Escaneamentos</h2>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Array.from(scannedTickets.entries())
                            .slice(-10)
                            .reverse()
                            .map(([scannedTicketId, isValid]) => (
                                <div
                                    key={scannedTicketId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        {isValid ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <span className="font-mono text-sm">{scannedTicketId.slice(-8)}</span>
                                    </div>
                                    <Badge variant={isValid ? 'default' : 'destructive'}>
                                        {isValid ? 'Válido' : 'Inválido'}
                                    </Badge>
                                </div>
                            ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
