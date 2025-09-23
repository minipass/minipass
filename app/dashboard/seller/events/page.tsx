import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import PaymentSetup from '@/components/PaymentSetup'
import SellerEventList from '@/components/SellerEventList'
import SellerEventsHeader from '@/components/SellerEventsHeader'

export default async function SellerEventsPage() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <SellerEventsHeader />

                {/* Payment Setup */}
                <div className="mb-8">
                    <PaymentSetup />
                </div>

                {/* Event List */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <SellerEventList />
                </div>
            </div>
        </div>
    )
}
