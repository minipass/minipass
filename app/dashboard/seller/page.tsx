import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SellerPage() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    // Redirect to events page since dashboard functionality has been moved there
    redirect('/dashboard/seller/events')
}
