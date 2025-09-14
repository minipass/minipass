import { headers } from 'next/headers'

import { api } from '@/convex/_generated/api'

import { getConvexClient } from '@/lib/convex'
import { PaymentProviderFactory } from '@/lib/payment/provider-factory'

type AsaasWebhookEvent = {
    id: string
    event: string
    [key: string]: any
}

export async function POST(req: Request) {
    console.log('Asaas webhook received')

    const body = await req.json()
    const headersList = await headers()
    const signature = headersList.get('asaas-access-token') as string

    const event: AsaasWebhookEvent = body
    try {
        console.log('Attempting to parse Asaas webhook event')
        const asaasProvider = PaymentProviderFactory.getProvider('asaas')
        await asaasProvider.verifyWebhook('', signature)
        console.log('Asaas webhook event parsed successfully:', event.event)
    } catch (err) {
        console.error('Asaas webhook parsing failed:', err)
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        })
    }

    const convex = getConvexClient()

    console.log(`Processing ${event.event}`)
    if (event.event === 'CHECKOUT_PAID') {
        console.log('Started processing CHECKOUT_PAID')
        const checkoutData = event.checkout

        // Get checkout session from database
        const checkoutSession = await convex.query(api.payment.getCheckoutSession, {
            sessionId: checkoutData.id,
            provider: 'asaas',
        })
        if (!checkoutSession) {
            console.error('Checkout session not found')
            return new Response('Checkout session not found', { status: 404 })
        }

        try {
            const result = await convex.mutation(api.events.purchaseTicket, {
                eventId: checkoutSession.metadata.eventId,
                userId: checkoutSession.metadata.userId,
                waitingListId: checkoutSession.metadata.waitingListId,
                paymentInfo: {
                    paymentIntentId: checkoutData.id,
                    amount: checkoutSession.metadata.price,
                },
            })
            console.log('Purchase ticket mutation completed:', result)
        } catch (error) {
            console.error('Error processing Asaas webhook:', error)
            return new Response('Error processing webhook', { status: 500 })
        }

        console.log('Finished processing CHECKOUT_PAID')
    }

    return new Response(null, { status: 200 })
}
