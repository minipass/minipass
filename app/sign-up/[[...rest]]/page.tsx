'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

import logo from '@/images/logo.png'

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Crie sua conta</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                        entre na sua conta existente
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto">
                <SignUp
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
                    signInUrl="/sign-in"
                />
            </div>
        </div>
    )
}
