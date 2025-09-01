import { headers } from 'next/headers'

import { api } from '@/convex/_generated/api'

import { getConvexClient } from '@/lib/convex'
import { PaymentProviderFactory } from '@/lib/payment/provider-factory'

export async function POST(req: Request) {
    console.log('Asaas webhook received')

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('asaas-access-token') as string

    let event: any
    try {
        console.log('Attempting to parse Asaas webhook event')
        const asaasProvider = PaymentProviderFactory.getProvider('asaas')
        event = await asaasProvider.verifyWebhook(body, signature)
        console.log('Asaas webhook event parsed successfully:', event.event)
    } catch (err) {
        console.error('Asaas webhook parsing failed:', err)
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        })
    }

    const convex = getConvexClient()

    if (event.event === 'PAYMENT_RECEIVED') {
        console.log('Processing PAYMENT_RECEIVED')
        const payment = event.payment
        const metadata = JSON.parse(payment.externalReference)

        try {
            const result = await convex.mutation(api.events.purchaseTicket, {
                eventId: metadata.eventId,
                userId: metadata.userId,
                waitingListId: metadata.waitingListId,
                paymentInfo: {
                    paymentIntentId: payment.id,
                    amount: payment.value,
                },
            })
            console.log('Purchase ticket mutation completed:', result)
        } catch (error) {
            console.error('Error processing Asaas webhook:', error)
            return new Response('Error processing webhook', { status: 500 })
        }
    }

    return new Response(null, { status: 200 })
}
