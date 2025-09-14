import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Suspense } from 'react'

import logo from '@/images/minipass.svg'

function SignUpForm() {
    return (
        <div className="mt-8 flex w-full justify-center">
            <SignUp
                appearance={{
                    layout: {
                        logoImageUrl: logo.src,
                        helpPageUrl: '/help',
                        privacyPageUrl: '/privacy',
                        termsPageUrl: '/terms',
                    },
                    elements: {
                        formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case',
                        card: 'shadow-none border-none bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                        formFieldInput: 'border border-gray-300 focus:border-primary focus:ring-primary',
                        footerActionLink: 'text-primary hover:text-primary/80',
                        rootBox: 'shadow-none',
                        main: 'shadow-none',
                    },
                }}
                fallbackRedirectUrl="/"
                signInUrl="/sign-in"
            />
        </div>
    )
}

export default function SignUpPage() {
    return (
        <div className="min-h-[calc(100dvh-var(--header-height))] bg-background flex flex-col justify-center lg:py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">Crie sua conta</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Ou{' '}
                    <Link href="/sign-in" className="font-medium text-primary hover:text-primary/80">
                        entre na sua conta existente
                    </Link>
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="mt-8 flex w-full justify-center">
                        <div className="bg-card py-8 px-4 shadow sm:rounded-sm sm:px-10 w-full max-w-md">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                                <div className="w-32 h-4 bg-muted rounded animate-pulse"></div>
                                <div className="w-48 h-4 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                }
            >
                <SignUpForm />
            </Suspense>
        </div>
    )
}
