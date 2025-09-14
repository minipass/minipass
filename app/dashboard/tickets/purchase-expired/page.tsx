import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

async function TicketExpired() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    // Redirect to the main tickets page
    redirect('/dashboard/tickets?expired=true')
}

export default TicketExpired
