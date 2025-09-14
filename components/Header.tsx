'use client'

import { UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Image from 'next/image'
import Link from 'next/link'

import logo from '@/images/logo.png'

import SearchBar from './SearchBar'

function Header() {
    return (
        <div className="border-b h-12">
            <div className="flex items-center gap-2 px-3 h-full">
                {/* Logo and Search Bar Group */}
                <div className="flex items-center gap-2 flex-1">
                    <Link href="/" className="font-bold shrink-0">
                        <Image src={logo} alt="logo" width={100} height={100} className="w-16 lg:w-20" />
                    </Link>
                    <div className="flex-1 max-w-2xl">
                        <SearchBar />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
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
                </div>
            </div>
        </div>
    )
}

export default Header
