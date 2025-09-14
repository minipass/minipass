import EventList from '@/components/EventList'
import { commonMetadata, generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata(commonMetadata.dashboard)

export default function DashboardPage() {
    return (
        <div className="">
            <EventList />
        </div>
    )
}
