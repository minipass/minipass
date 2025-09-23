import { ConvexError, v } from 'convex/values'

import { PaymentProviderFactory } from '../lib/payment/provider-factory'
import { api, internal } from './_generated/api'
import { Doc } from './_generated/dataModel'
import { action, internalMutation, query } from './_generated/server'
import { CheckoutSession } from './types'

// Get user's payment accounts
type GetUsersPaymentAccountsResult = {
    stripeConnectId: string | undefined
    asaasSubaccountId: string | undefined
    feePercentage: number
}
export const getUsersPaymentAccounts = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }): Promise<GetUsersPaymentAccountsResult> => {
        const user = await ctx.db
            .query('users')
            .withIndex('by_user_id', q => q.eq('userId', userId))
            .first()

        if (!user) {
            throw new ConvexError('Usuário não encontrado')
        }

        return {
            stripeConnectId: user.stripeConnectId,
            asaasSubaccountId: user.asaasSubaccountId,
            feePercentage: user.feePercentage,
        }
    },
})

// Create payment account
export const createPaymentAccount = action({
    args: {
        userId: v.string(),
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
        accountData: v.object({
            name: v.string(),
            email: v.string(),
            birthDate: v.string(),
            cpfCnpj: v.string(),
            mobilePhone: v.string(),
            incomeValue: v.number(),
            address: v.string(),
            addressNumber: v.string(),
            province: v.string(),
            postalCode: v.string(),
            personType: v.union(v.literal('FISICA'), v.literal('JURIDICA')),
        }),
    },
    handler: async (ctx, { userId, provider, accountData }) => {
        // Check if user already has an account for this provider
        const user: GetUsersPaymentAccountsResult = await ctx.runQuery(api.payment.getUsersPaymentAccounts, { userId })

        if (provider === 'stripe' && user.stripeConnectId) {
            return { account: user.stripeConnectId }
        }

        if (provider === 'asaas' && user.asaasSubaccountId) {
            return { account: user.asaasSubaccountId }
        }

        // Check if user already has an account for the other provider
        if (provider === 'stripe' && user.asaasSubaccountId) {
            throw new ConvexError(
                'Você já tem uma conta Asaas. Entre em contato com o suporte para trocar de provedor.',
            )
        }

        if (provider === 'asaas' && user.stripeConnectId) {
            throw new ConvexError(
                'Você já tem uma conta Stripe. Entre em contato com o suporte para trocar de provedor.',
            )
        }

        const paymentProvider = PaymentProviderFactory.getProvider(provider)
        const account = await paymentProvider.createAccount(accountData)

        await ctx.runMutation(internal.payment.updateUserPaymentAccount, {
            userId,
            provider,
            accountId: account.accountId,
            walletId: account.walletId,
        })

        return { account: account.accountId }
    },
})

// Update user payment account (internal mutation)
export const updateUserPaymentAccount = internalMutation({
    args: {
        userId: v.string(),
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
        accountId: v.string(),
        walletId: v.optional(v.string()),
    },
    handler: async (ctx, { userId, provider, accountId, walletId }) => {
        const user = await ctx.db
            .query('users')
            .withIndex('by_user_id', q => q.eq('userId', userId))
            .first()

        if (!user) {
            throw new ConvexError('Usuário não encontrado')
        }

        const updateData = {
            stripeConnectId: provider === 'stripe' ? accountId : undefined,
            asaasSubaccountId: provider === 'asaas' ? accountId : undefined,
            asaasWalletId: provider === 'asaas' ? walletId : undefined,
        }

        await ctx.db.patch(user._id, updateData)
    },
})

// Create account link
export const createAccountLink = action({
    args: {
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
        accountId: v.string(),
    },
    handler: async (ctx, { provider, accountId }) => {
        const paymentProvider = PaymentProviderFactory.getProvider(provider)
        return await paymentProvider.createAccountLink(accountId)
    },
})

// Checkout session manipulation
export const getCheckoutSession = query({
    args: {
        sessionId: v.string(),
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
    },
    handler: async (ctx, { sessionId, provider }) => {
        return await ctx.db
            .query('checkoutSessions')
            .withIndex('by_session_id_and_provider', q => q.eq('sessionId', sessionId).eq('provider', provider))
            .first()
    },
})

export const createCheckoutSession = action({
    args: {
        eventId: v.id('events'),
        quantity: v.number(),
    },
    handler: async (ctx, { eventId, quantity }) => {
        const userIdentity = await ctx.auth.getUserIdentity()
        if (!userIdentity) throw new ConvexError('Usuário não autenticado')

        // Get event details
        const event = await ctx.runQuery(api.events.getById, { eventId })
        if (!event) throw new ConvexError('Evento não encontrado')

        // Get waiting list entry for current user
        const waitingListEntry = await ctx.runQuery(api.waitingList.getQueuePosition, {
            eventId,
            userId: userIdentity.subject,
        })

        if (!waitingListEntry || waitingListEntry.status !== 'offered') {
            throw new ConvexError('Nenhuma oferta de ingresso válida encontrada')
        }

        // Get event owner's payment account
        const eventOwner = await ctx.runQuery(api.payment.getUsersPaymentAccounts, {
            userId: event.userId,
        })

        if (!eventOwner) throw new ConvexError('Proprietário do evento não encontrado')

        const provider = eventOwner.stripeConnectId ? 'stripe' : eventOwner.asaasSubaccountId ? 'asaas' : null
        if (!provider) throw new ConvexError('Provedor de pagamento não encontrado para o proprietário do evento!')

        const accountId = provider === 'stripe' ? eventOwner.stripeConnectId : eventOwner.asaasSubaccountId
        if (!accountId) throw new ConvexError('Conta de pagamento não encontrada para o proprietário do evento!')

        const paymentProvider = PaymentProviderFactory.getProvider(provider)

        let session: CheckoutSession
        try {
            session = await paymentProvider.createCheckoutSession({
                event,
                quantity,
                accountId,
                feePercentage: eventOwner.feePercentage,
            })
        } catch (error) {
            console.error('Failed to create checkout session:', error)
            throw new ConvexError(
                'Falha ao criar a sessão de checkout. Contate o administrador do evento ou o time de suporte.',
            )
        }

        // After session was created, make sure we store the metadata
        await ctx.runMutation(internal.payment.storeCheckoutSessionMetadata, {
            sessionId: session.sessionId,
            sessionUrl: session.sessionUrl,
            provider,
            metadata: {
                eventId,
                userId: userIdentity.subject,
                waitingListId: waitingListEntry._id,
                eventName: event.name,
                eventDescription: event.description,
                price: event.price * quantity,
            },
        })

        return session
    },
})

// Process refunds
export const processRefunds = action({
    args: {
        eventId: v.id('events'),
    },
    handler: async (ctx, { eventId }) => {
        // Get event details
        const event = await ctx.runQuery(api.events.getById, { eventId })
        if (!event) throw new ConvexError('Evento não encontrado')

        // Get event owner's payment account
        const eventOwner = await ctx.runQuery(api.payment.getUsersPaymentAccounts, {
            userId: event.userId,
        })

        if (!eventOwner) throw new ConvexError('Proprietário do evento não encontrado')

        const provider = eventOwner.stripeConnectId ? 'stripe' : eventOwner.asaasSubaccountId ? 'asaas' : null
        if (!provider) throw new ConvexError('Provedor de pagamento não encontrado para o proprietário do evento!')

        const accountId = provider === 'stripe' ? eventOwner.stripeConnectId : eventOwner.asaasSubaccountId
        if (!accountId) throw new ConvexError('Conta de pagamento não encontrada para o proprietário do evento!')

        // Get all valid tickets for this event
        const tickets: Doc<'tickets'>[] = await ctx.runQuery(api.tickets.getValidTicketsForEvent, { eventId })

        // Process refunds for each ticket
        const results = await Promise.allSettled(
            tickets.map(async ticket => {
                try {
                    if (!ticket.paymentIntentId) {
                        throw new ConvexError('Informações de pagamento não encontradas')
                    }

                    const paymentProvider = PaymentProviderFactory.getProvider(provider)
                    await paymentProvider.processRefund(ticket.paymentIntentId, accountId, ticket.amount || 0)

                    // Update ticket status to refunded
                    await ctx.runMutation(api.tickets.updateTicketStatus, {
                        ticketId: ticket._id,
                        status: 'refunded',
                    })

                    return { success: true, ticketId: ticket._id }
                } catch (error) {
                    console.error(`Failed to refund ticket ${ticket._id}:`, error)
                    return { success: false, ticketId: ticket._id, error }
                }
            }),
        )

        // Check if all refunds were successful
        const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value.success)

        return { success: allSuccessful, results }
    },
})

// Store checkout session metadata for future reference
export const storeCheckoutSessionMetadata = internalMutation({
    args: {
        sessionId: v.string(),
        sessionUrl: v.string(),
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
        metadata: v.object({
            eventId: v.id('events'),
            userId: v.string(),
            waitingListId: v.id('waitingList'),
            eventName: v.string(),
            eventDescription: v.string(),
            price: v.number(),
        }),
    },
    handler: async (ctx, { sessionId, sessionUrl, provider, metadata }) => {
        await ctx.db.insert('checkoutSessions', {
            sessionId,
            sessionUrl,
            provider,
            metadata,
        })
    },
})
