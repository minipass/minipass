import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const getUserTicketForEvent = query({
    args: {
        eventId: v.id('events'),
        userId: v.string(),
    },
    handler: async (ctx, { eventId, userId }) => {
        const ticket = await ctx.db
            .query('tickets')
            .withIndex('by_user_event', q => q.eq('userId', userId).eq('eventId', eventId))
            .first()

        return ticket
    },
})

export const getTicketById = query({
    args: { ticketId: v.id('tickets') },
    handler: async (ctx, { ticketId }) => {
        return await ctx.db.get(ticketId)
    },
})

export const getTicketWithDetails = query({
    args: { ticketId: v.id('tickets') },
    handler: async (ctx, { ticketId }) => {
        const ticket = await ctx.db.get(ticketId)
        if (!ticket) return null

        const event = await ctx.db.get(ticket.eventId)

        return {
            ...ticket,
            event,
        }
    },
})

export const getValidTicketsForEvent = query({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        return await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .filter(q => q.or(q.eq(q.field('status'), 'valid'), q.eq(q.field('status'), 'used')))
            .collect()
    },
})

export const updateTicketStatus = mutation({
    args: {
        ticketId: v.id('tickets'),
        status: v.union(v.literal('valid'), v.literal('used'), v.literal('refunded'), v.literal('cancelled')),
    },
    handler: async (ctx, { ticketId, status }) => {
        await ctx.db.patch(ticketId, { status })
    },
})

// Mark ticket as consumed (used) - for scanner validation
export const consumeTicket = mutation({
    args: {
        ticketId: v.id('tickets'),
    },
    handler: async (ctx, { ticketId }) => {
        const ticket = await ctx.db.get(ticketId)
        if (!ticket) {
            throw new ConvexError('Ticket not found')
        }

        if (ticket.status !== 'valid') {
            throw new ConvexError('Ticket is not valid or already used')
        }

        await ctx.db.patch(ticketId, { status: 'used' })
        return { success: true, ticketId }
    },
})

// Check if the current user owns the event (for scanner access)
export const checkEventOwnership = query({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        const userIdentity = await ctx.auth.getUserIdentity()
        if (!userIdentity) throw new ConvexError('Usuário não autenticado')

        const userId = userIdentity.subject

        // Check if the user owns the event
        const event = await ctx.db.get(eventId)
        if (!event) throw new ConvexError('Evento não encontrado')

        return event.userId === userId
    },
})

// Get all valid tickets for an event (for scanner validation)
export const getValidTicketsForScanner = query({
    args: { eventId: v.id('events') },
    handler: async (ctx, { eventId }) => {
        const userIdentity = await ctx.auth.getUserIdentity()
        if (!userIdentity) throw new ConvexError('Usuário não autenticado')

        const userId = userIdentity.subject

        // Check if the user owns the event
        const event = await ctx.db.get(eventId)
        if (!event) throw new ConvexError('Evento não encontrado')

        if (event.userId !== userId) {
            throw new ConvexError('Acesso negado: Você não é o organizador deste evento')
        }

        // Return only valid tickets (not used ones) for scanning
        return await ctx.db
            .query('tickets')
            .withIndex('by_event', q => q.eq('eventId', eventId))
            .filter(q => q.eq(q.field('status'), 'valid'))
            .collect()
    },
})
