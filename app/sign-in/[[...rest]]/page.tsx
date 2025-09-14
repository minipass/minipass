import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Suspense } from 'react'

import logo from '@/images/logo.png'

function SignInForm() {
    return (
        <div className="mt-8 flex w-full justify-center">
            <SignIn
                appearance={{
                    layout: {
                        logoImageUrl: logo.src,
                        helpPageUrl: '/help',
                        privacyPageUrl: '/privacy',
                        termsPageUrl: '/terms',
                    },
                    elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                        card: 'shadow-none border-none bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                        formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                        footerActionLink: 'text-blue-600 hover:text-blue-500',
                        rootBox: 'shadow-none',
                        main: 'shadow-none',
                    },
                }}
                fallbackRedirectUrl="/"
                signUpUrl="/sign-up"
            />
        </div>
    )
}

export default function SignInPage() {
    return (
        <div className="min-h-[calc(100dvh-var(--header-height))] bg-gray-50 flex flex-col justify-center lg:py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Entre na sua conta</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                        crie uma nova conta
                    </Link>
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="mt-8 flex w-full justify-center">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-sm sm:px-10 w-full max-w-md">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                }
            >
                <SignInForm />
            </Suspense>
        </div>
    )
}
