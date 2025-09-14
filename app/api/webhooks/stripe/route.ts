import { headers } from 'next/headers'
import Stripe from 'stripe'

import { api } from '@/convex/_generated/api'

import { getConvexClient } from '@/lib/convex'
import { PaymentProviderFactory } from '@/lib/payment/provider-factory'

export async function POST(req: Request) {
    console.log('Stripe webhook received')

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature') as string

    console.log('Webhook signature:', signature ? 'Present' : 'Missing')

    let stripeEvent: Stripe.Event

    try {
        console.log('Attempting to construct webhook event')
        const stripeProvider = PaymentProviderFactory.getProvider('stripe')
        stripeEvent = await stripeProvider.verifyWebhook(body, signature)
        console.log('Webhook event constructed successfully:', stripeEvent.type)
    } catch (err) {
        console.error('Webhook construction failed:', err)
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        })
    }

    const convex = getConvexClient()

    if (stripeEvent.type === 'checkout.session.completed') {
        console.log('Processing checkout.session.completed')
        const session = stripeEvent.data.object

        // Get checkout session from database
        const checkoutSession = await convex.query(api.payment.getCheckoutSession, {
            sessionId: session.id,
            provider: 'stripe',
        })
        if (!checkoutSession) {
            console.error('Checkout session not found')
            return new Response('Checkout session not found', { status: 404 })
        }

        // Get event from database
        const event = await convex.query(api.events.getById, { eventId: checkoutSession.metadata.eventId })
        if (!event) {
            console.error('Event not found')
            return new Response('Event not found', { status: 404 })
        }

        try {
            const result = await convex.mutation(api.events.purchaseTicket, {
                eventId: checkoutSession.metadata.eventId,
                userId: checkoutSession.metadata.userId,
                waitingListId: checkoutSession.metadata.waitingListId,
                paymentInfo: {
                    paymentIntentId: session.payment_intent as string,
                    amount: session.amount_total ?? 0,
                },
            })
            console.log('Purchase ticket mutation completed:', result)
        } catch (error) {
            console.error('Error processing webhook:', error)
            return new Response('Error processing webhook', { status: 500 })
        }
    }

    return new Response(null, { status: 200 })
}
