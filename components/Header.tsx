import Link from 'next/link'
import { Suspense } from 'react'

import AuthActions from './AuthActions'
import Logo from './Logo'
import SearchBar from './SearchBar'

function Header() {
    return (
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-2 px-3 h-12">
                {/* Logo and Search Bar Group */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Link href="/" className="shrink-0">
                        <Logo className="h-8 w-auto" />
                    </Link>
                    <div className="flex-1 max-w-2xl hidden sm:block">
                        <SearchBar />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Suspense
                        fallback={
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                            </div>
                        }
                    >
                        <AuthActions />
                    </Suspense>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="px-3 pb-2 sm:hidden">
                <SearchBar />
            </div>
        </div>
    )
}

export default Header
