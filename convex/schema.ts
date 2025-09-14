import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    events: defineTable({
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(),
        price: v.number(),
        totalTickets: v.number(),
        userId: v.string(),
        imageStorageId: v.optional(v.id('_storage')),
        isCancelled: v.optional(v.boolean()),
    }),
    tickets: defineTable({
        eventId: v.id('events'),
        userId: v.string(),
        purchasedAt: v.number(),
        status: v.union(v.literal('valid'), v.literal('used'), v.literal('refunded'), v.literal('cancelled')),
        paymentIntentId: v.optional(v.string()),
        amount: v.optional(v.number()),
    })
        .index('by_event', ['eventId'])
        .index('by_user', ['userId'])
        .index('by_user_event', ['userId', 'eventId'])
        .index('by_payment_intent', ['paymentIntentId']),

    waitingList: defineTable({
        eventId: v.id('events'),
        userId: v.string(),
        status: v.union(v.literal('waiting'), v.literal('offered'), v.literal('purchased'), v.literal('expired')),
        offerExpiresAt: v.optional(v.number()),
        quantity: v.number(),
    })
        .index('by_event_status', ['eventId', 'status'])
        .index('by_user_event', ['userId', 'eventId'])
        .index('by_user', ['userId']),

    checkoutSessions: defineTable({
        provider: v.union(v.literal('stripe'), v.literal('asaas')),
        sessionId: v.string(),
        sessionUrl: v.string(),
        metadata: v.object({
            eventId: v.id('events'),
            userId: v.string(),
            waitingListId: v.id('waitingList'),
            eventName: v.string(),
            eventDescription: v.string(),
            price: v.number(),
        }),
    }).index('by_session_id_and_provider', ['sessionId', 'provider']),

    users: defineTable({
        name: v.string(),
        email: v.string(),
        userId: v.string(),
        stripeConnectId: v.optional(v.string()),
        asaasSubaccountId: v.optional(v.string()),
        asaasWalletId: v.optional(v.string()),
        feePercentage: v.number(),
    })
        .index('by_user_id', ['userId'])
        .index('by_email', ['email']),
})
