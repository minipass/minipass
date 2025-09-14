'use client'

import { UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'

export default function AuthActions() {
    return (
        <>
            <Authenticated>
                <Link href="/seller">
                    <button className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700 transition hidden sm:block">
                        Vender
                    </button>
                </Link>

                <Link href="/tickets">
                    <button className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded hover:bg-gray-200 transition border border-gray-300 hidden lg:block">
                        Meus Ingressos
                    </button>
                </Link>
                <UserButton appearance={{ layout: { shimmer: false } }} />
            </Authenticated>

            <Unauthenticated>
                <Link href="/sign-in">
                    <button className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded hover:bg-gray-200 transition border border-gray-300">
                        Entrar
                    </button>
                </Link>
            </Unauthenticated>
        </>
    )
}
