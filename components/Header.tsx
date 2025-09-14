import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import logo from '@/images/minipass-full.svg'

import AuthActions from './AuthActions'
import SearchBar from './SearchBar'

function Header() {
    return (
        <div className="border-b h-12">
            <div className="flex items-center gap-2 px-3 h-full">
                {/* Logo and Search Bar Group */}
                <div className="flex items-center gap-2 flex-1">
                    <Link href="/" className="font-bold shrink-0">
                        <Image src={logo} alt="logo" className="w-32 lg:w-40" />
                    </Link>
                    <div className="flex-1 max-w-2xl">
                        <SearchBar />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Suspense
                        fallback={
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        }
                    >
                        <AuthActions />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default Header
