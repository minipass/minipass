import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

async function TicketSuccess() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    // Redirect to the main tickets page to see all tickets grouped by event
    redirect('/dashboard/tickets?success=true')
}

export default TicketSuccess
