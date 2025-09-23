import { Resend } from '@convex-dev/resend'
import { pretty, render } from '@react-email/render'
import { v } from 'convex/values'

import { TicketEmailTemplate } from '../emails/ticketEmail'
import { api, components } from './_generated/api'
import { action, internalAction, internalMutation } from './_generated/server'

// Initialize Resend component
export const resend: Resend = new Resend(components.resend, {
    testMode: process.env.IS_DEV !== 'false', // Only enable in case we've explicitly set as not dev
})

// Send multiple ticket emails (for bulk purchases) - now sends all tickets in one email
export const sendTicketsEmail = internalAction({
    args: {
        ticketIds: v.array(v.id('tickets')),
        userId: v.string(),
    },
    handler: async (ctx, { ticketIds, userId }) => {
        if (ticketIds.length === 0) {
            throw new Error('No tickets provided')
        }

        // Get all ticket details
        const tickets = []
        for (const ticketId of ticketIds) {
            const ticket = await ctx.runQuery(api.tickets.getTicketById, { ticketId })
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`)
            }
            tickets.push(ticket)
        }

        // Get event details (all tickets should be for the same event)
        const event = await ctx.runQuery(api.events.getById, { eventId: tickets[0].eventId })
        if (!event) {
            throw new Error('Event not found')
        }

        // Get user details
        const user = await ctx.runQuery(api.users.getUserById, { userId })
        if (!user) {
            throw new Error('User not found')
        }

        // Format event date
        const eventDate = new Date(event.eventDate).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })

        // Prepare tickets for email
        const ticketsForEmail = tickets.map(ticket => ({
            ticketId: ticket._id,
        }))

        // Calculate total price
        const totalPrice = tickets.reduce((sum, ticket) => sum + (ticket.amount || event.price), 0)

        // Render email template
        const html = await pretty(
            await render(
                TicketEmailTemplate({
                    eventName: event.name,
                    eventDate,
                    eventLocation: event.location,
                    tickets: ticketsForEmail,
                    customerName: user.name,
                    totalPrice,
                }),
            ),
        )

        // Send email
        await resend.sendEmail(ctx, {
            from: 'Minipass <contato@tickets.minipass.com.br>',
            to: user.email,
            subject: `🎫 Seus ingressos para ${event.name}`,
            html,
        })

        return { success: true, ticketsSent: ticketIds.length }
    },
})

// Cleanup old emails (this runs periodically from crons.ts)
export const cleanupOldEmails = internalMutation({
    args: {},
    handler: async ctx => {
        const OLDER_THAN_SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
        await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
            olderThan: OLDER_THAN_SEVEN_DAYS,
        })
        await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, {
            olderThan: OLDER_THAN_SEVEN_DAYS * 4, // Keep abandoned emails longer
        })
    },
})

// Test email function (for development/testing)
export const sendTestEmail = action({
    args: {
        to: v.string(),
    },
    handler: async (ctx, { to }) => {
        // Dummy test tickets
        const testTickets = [
            {
                ticketId: 'test-ticket-001',
            },
            {
                ticketId: 'test-ticket-002',
            },
        ]

        const html = await pretty(
            await render(
                TicketEmailTemplate({
                    eventName: 'Evento de Teste',
                    eventDate: 'Sábado, 15 de fevereiro de 2025 às 20:00',
                    eventLocation: 'Local de Teste, São Paulo - SP',
                    tickets: testTickets,
                    customerName: 'Usuário de Teste',
                    totalPrice: 100.0,
                }),
            ),
        )

        const email = await resend.sendEmail(ctx, {
            from: 'Minipass <contato@tickets.minipass.com.br>',
            to,
            subject: '🎫 Teste - Seus ingressos para Evento de Teste',
            html,
        })

        return { success: true, email }
    },
})
