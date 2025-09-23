import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval(
    'cleanup-expired-offers',
    { minutes: 1 }, // Run every 1 minute
    internal.waitingList.cleanupExpiredOffers,
)

crons.interval('cleanup-old-emails', { hours: 1 }, internal.emailService.cleanupOldEmails)

export default crons
