'use client'

import { UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'

export default function AuthActions() {
    return (
        <>
            <Authenticated>
                <Link href="/dashboard/seller/events">
                    <button className="bg-primary text-primary-foreground px-2 py-1 text-sm rounded border-2 border-primary hover:bg-primary/90 transition hidden sm:block">
                        Meus Eventos
                    </button>
                </Link>

                <Link href="/dashboard/tickets">
                    <button className="bg-secondary text-secondary-foreground px-2 py-1 text-sm rounded border-2 border-border hover:bg-secondary/80 transition hidden lg:block">
                        Meus Ingressos
                    </button>
                </Link>
                <UserButton appearance={{ layout: { shimmer: false } }} />
            </Authenticated>

            <Unauthenticated>
                <Link href="/sign-in">
                    <button className="bg-secondary text-secondary-foreground px-2 py-1 text-sm rounded border-2 border-border hover:bg-secondary/80 transition">
                        Entrar
                    </button>
                </Link>
            </Unauthenticated>
        </>
    )
}
