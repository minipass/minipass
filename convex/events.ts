import { MINUTE, RateLimiter } from '@convex-dev/rate-limiter'
import { ConvexError, v } from 'convex/values'

import { components, internal } from './_generated/api'
import { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from './constants'

export type Metrics = {
    soldTickets: number
    refundedTickets: number
    cancelledTickets: number
    revenue: number
}

// Initialize rate limiter
const rateLimiter = new RateLimiter(components.rateLimiter, {
    queueJoin: {
        kind: 'fixed window',
        rate: 3, // 3 joins allowed
        period: 30 * MINUTE, // in 30 minutes
    },
})

export const get = query({
    args: {},
    handler: async ctx => {
        return await ctx.db
            .query('events')
            .filter(q => q.eq(q.field('isCancelled'), undefined))
            .collect()
    },
})

export const getById = query({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        return await ctx.db.get(eventId)
    },
})

export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(), // Store as timestamp
        price: v.number(),
        totalTickets: v.number(),
        displayTotalTickets: v.boolean(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const eventId = await ctx.db.insert('events', {
            name: args.name,
            description: args.description,
            location: args.location,
            eventDate: args.eventDate,
            price: args.price,
            totalTickets: args.totalTickets,
            displayTotalTickets: args.displayTotalTickets,
            userId: args.userId,
        })
        return eventId
    },
})

// Join waiting list for an event
export const joinWaitingList = mutation({
    // Function takes an event ID, user ID, and optional quantity as arguments
    args: {
        eventId: v.id('events'),
        userId: v.string(),
        quantity: v.number(),
    },
    handler: async (ctx, { eventId, userId, quantity }) => {
        // Rate limit check
        const status = await rateLimiter.limit(ctx, 'queueJoin', { key: userId })
        if (!status.ok) {
            throw new ConvexError(
                `Você entrou na lista de espera muitas vezes. Por favor, aguarde ${Math.ceil(
                    status.retryAfter / (60 * 1000),
                )} minutos antes de tentar novamente.`,
            )
        }

        // First check if user already has an active entry in waiting list for this event
        // Active means any status except EXPIRED
        const existingEntry = await ctx.db
            .query('waitingList')
            .withIndex('by_user_event', q => q.eq('userId', userId).eq('eventId', eventId))
            .filter(q => q.neq(q.field('status'), WAITING_LIST_STATUS.EXPIRED))
            .first()

        // Don't allow duplicate entries
        if (existingEntry) {
            throw new Error('Já está na lista de espera para este evento')
        }

        // Verify the event exists
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error('Evento não encontrado')

        // Check if there are any available tickets right now
        // Calculate availability inline to avoid circular reference
        const purchasedCount = await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .collect()
            .then(
                tickets =>
                    tickets.filter(t => t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED).length,
            )

        // Count current valid offers (including quantities)
        const now = Date.now()
        const activeOffers = await ctx.db
            .query('waitingList')
            .withIndex('by_event_status', q => q.eq('eventId', eventId).eq('status', WAITING_LIST_STATUS.OFFERED))
            .collect()
            .then(entries =>
                entries.filter(e => (e.offerExpiresAt ?? 0) > now).reduce((total, entry) => total + entry.quantity, 0),
            )

        const availableSpots = event.totalTickets - (purchasedCount + activeOffers)
        const available = availableSpots >= quantity

        // If not enough tickets available, throw a specific error
        if (!available && availableSpots > 0) {
            throw new ConvexError(`Não há ${quantity} ingressos disponíveis. Tente menos ingressos.`)
        }

        if (available) {
            // If tickets are available, create an offer entry
            const waitingListId = await ctx.db.insert('waitingList', {
                eventId,
                userId,
                status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
                offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
                quantity: quantity,
            })

            // Schedule a job to expire this offer after the offer duration
            await ctx.scheduler.runAfter(DURATIONS.TICKET_OFFER, internal.waitingList.expireOffer, {
                waitingListId,
                eventId,
            })
        } else {
            // If no tickets available, add to waiting list
            await ctx.db.insert('waitingList', {
                eventId,
                userId,
                status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
                quantity: quantity,
            })
        }

        // Return appropriate status message
        const ticketText = quantity === 1 ? 'Ingresso' : `${quantity} ingressos`
        return {
            success: true,
            status: available
                ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
                : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
            message: available
                ? `${ticketText} oferecido - você tem 30 minutos para comprar`
                : `Adicionado à lista de espera para ${ticketText} - você será notificado quando os ingressos estiverem disponíveis`,
        }
    },
})

// Purchase ticket
export const purchaseTicket = mutation({
    args: {
        eventId: v.id('events'),
        userId: v.string(),
        waitingListId: v.id('waitingList'),
        paymentInfo: v.object({
            paymentIntentId: v.string(),
            amount: v.number(),
        }),
    },
    handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
        console.log('Starting purchaseTicket handler', {
            eventId,
            userId,
            waitingListId,
        })

        // Verify waiting list entry exists and is valid
        const waitingListEntry = await ctx.db.get(waitingListId)
        console.log('Waiting list entry:', waitingListEntry)

        if (!waitingListEntry) {
            console.error('Waiting list entry not found')
            throw new Error('Entrada da lista de espera não encontrada')
        }

        if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
            console.error('Invalid waiting list status', {
                status: waitingListEntry.status,
            })
            throw new Error('Status inválido da lista de espera - a oferta de ingresso pode ter expirado')
        }

        if (waitingListEntry.userId !== userId) {
            console.error('User ID mismatch', {
                waitingListUserId: waitingListEntry.userId,
                requestUserId: userId,
            })
            throw new Error('A entrada da lista de espera não pertence a este usuário')
        }

        // Verify event exists and is active
        const event = await ctx.db.get(eventId)
        console.log('Event details:', event)

        if (!event) {
            console.error('Event not found', { eventId })
            throw new Error('Evento não encontrado')
        }

        if (event.isCancelled) {
            console.error('Attempted purchase of cancelled event', { eventId })
            throw new Error('Evento não está mais ativo')
        }

        try {
            console.log('Creating tickets with payment info', paymentInfo)

            // Get the quantity from the waiting list entry
            const quantity = waitingListEntry.quantity

            // Create multiple tickets based on quantity
            const ticketPromises = Array.from({ length: quantity }, () =>
                ctx.db.insert('tickets', {
                    eventId,
                    userId,
                    purchasedAt: Date.now(),
                    status: TICKET_STATUS.VALID,
                    paymentIntentId: paymentInfo.paymentIntentId,
                    amount: paymentInfo.amount / quantity, // Split the total amount across tickets
                }),
            )

            await Promise.all(ticketPromises)

            console.log('Updating waiting list status to purchased')
            await ctx.db.patch(waitingListId, {
                status: WAITING_LIST_STATUS.PURCHASED,
            })

            console.log('Processing queue for next person')

            // Process queue for next person
            await ctx.runMutation(internal.waitingList.processQueue, { eventId })

            console.log('Purchase ticket completed successfully')
        } catch (error) {
            console.error('Failed to complete ticket purchase:', error)
            throw new Error(`Falha ao completar a compra do ingresso: ${error}`)
        }
    },
})

// Get user's tickets with event information
export const getUserTickets = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const tickets = await ctx.db
            .query('tickets')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect()

        const ticketsWithEvents = await Promise.all(
            tickets.map(async ticket => {
                const event = await ctx.db.get(ticket.eventId)
                return {
                    ...ticket,
                    event,
                }
            }),
        )

        return ticketsWithEvents
    },
})

// Get user's tickets grouped by event
export const getUserTicketsGroupedByEvent = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const tickets = await ctx.db
            .query('tickets')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect()

        // Group tickets by event
        const ticketsByEvent = new Map<Id<'events'>, { event: Doc<'events'>; tickets: Doc<'tickets'>[] }>()

        for (const ticket of tickets) {
            const event = await ctx.db.get(ticket.eventId)
            if (!event) continue

            const eventId = ticket.eventId
            if (!ticketsByEvent.has(eventId)) {
                ticketsByEvent.set(eventId, {
                    event,
                    tickets: [],
                })
            }

            ticketsByEvent.get(eventId)!.tickets.push(ticket)
        }

        // Convert to array and sort by event date
        const groupedTickets = Array.from(ticketsByEvent.values())
        groupedTickets.sort((a, b) => a.event.eventDate - b.event.eventDate)

        return groupedTickets
    },
})

// Get user's waiting list entries with event information
export const getUserWaitingList = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const entries = await ctx.db
            .query('waitingList')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect()

        const entriesWithEvents = await Promise.all(
            entries.map(async entry => {
                const event = await ctx.db.get(entry.eventId)
                return {
                    ...entry,
                    event,
                }
            }),
        )

        return entriesWithEvents
    },
})

export const getEventAvailability = query({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error('Evento não encontrado')

        // Count total purchased tickets
        const purchasedCount = await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .collect()
            .then(
                tickets =>
                    tickets.filter(t => t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED).length,
            )

        // Count current valid offers (including quantities)
        const now = Date.now()
        const activeOffers = await ctx.db
            .query('waitingList')
            .withIndex('by_event_status', q => q.eq('eventId', eventId).eq('status', WAITING_LIST_STATUS.OFFERED))
            .collect()
            .then(entries =>
                entries.filter(e => (e.offerExpiresAt ?? 0) > now).reduce((total, entry) => total + entry.quantity, 0),
            )

        const totalReserved = purchasedCount + activeOffers

        return {
            isSoldOut: totalReserved >= event.totalTickets,
            totalTickets: event.displayTotalTickets ? event.totalTickets : 0,
            purchasedCount: event.displayTotalTickets ? purchasedCount : 0,
            activeOffers: event.displayTotalTickets ? activeOffers : 0,
            remainingTickets: event.displayTotalTickets ? Math.max(0, event.totalTickets - totalReserved) : 0,
            availabilityHidden: !event.displayTotalTickets,
        }
    },
})

export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, { searchTerm }) => {
        const events = await ctx.db
            .query('events')
            .filter(q => q.eq(q.field('isCancelled'), undefined))
            .collect()

        return events.filter(event => {
            const searchTermLower = searchTerm.toLowerCase()
            return (
                event.name.toLowerCase().includes(searchTermLower) ||
                event.description.toLowerCase().includes(searchTermLower) ||
                event.location.toLowerCase().includes(searchTermLower)
            )
        })
    },
})

export const getSellerEvents = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const events = await ctx.db
            .query('events')
            .filter(q => q.eq(q.field('userId'), userId))
            .collect()

        // For each event, get ticket sales data
        const eventsWithMetrics = await Promise.all(
            events.map(async event => {
                const tickets = await ctx.db
                    .query('tickets')
                    .withIndex('by_event', q => q.eq('eventId', event._id))
                    .collect()

                const validTickets = tickets.filter(t => t.status === 'valid' || t.status === 'used')
                const refundedTickets = tickets.filter(t => t.status === 'refunded')
                const cancelledTickets = tickets.filter(t => t.status === 'cancelled')

                const metrics: Metrics = {
                    soldTickets: validTickets.length,
                    refundedTickets: refundedTickets.length,
                    cancelledTickets: cancelledTickets.length,
                    revenue: validTickets.length * event.price,
                }

                return {
                    ...event,
                    metrics,
                }
            }),
        )

        return eventsWithMetrics
    },
})

export const updateEvent = mutation({
    args: {
        eventId: v.id('events'),
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(),
        price: v.number(),
        totalTickets: v.number(),
        displayTotalTickets: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { eventId, ...updates } = args

        // Get current event to check tickets sold
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error('Evento não encontrado')

        const soldTickets = await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .filter(q => q.or(q.eq(q.field('status'), 'valid'), q.eq(q.field('status'), 'used')))
            .collect()

        // Ensure new total tickets is not less than sold tickets
        if (updates.totalTickets < soldTickets.length) {
            throw new Error(
                `Não é possível reduzir o total de ingressos abaixo de ${soldTickets.length} (número de ingressos já vendidos)`,
            )
        }

        await ctx.db.patch(eventId, updates)
        return eventId
    },
})

export const cancelEvent = mutation({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error('Evento não encontrado')

        // Get all valid tickets for this event
        const tickets = await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .filter(q => q.or(q.eq(q.field('status'), 'valid'), q.eq(q.field('status'), 'used')))
            .collect()

        if (tickets.length > 0) {
            throw new Error(
                'Não é possível cancelar evento com ingressos ativos. Por favor, reembolse todos os ingressos primeiro.',
            )
        }

        // Mark event as cancelled
        await ctx.db.patch(eventId, {
            isCancelled: true,
        })

        // Delete any waiting list entries
        const waitingListEntries = await ctx.db
            .query('waitingList')
            .withIndex('by_event_status', q => q.eq('eventId', eventId))
            .collect()

        for (const entry of waitingListEntries) {
            await ctx.db.delete(entry._id)
        }

        return { success: true }
    },
})
