import { SignUp } from '@clerk/nextjs'

import logo from '@/images/minipass.svg'

export default function SignUpPage() {
    return (
        <div className="min-h-[calc(100dvh-var(--header-height))] bg-background flex flex-col justify-center lg:py-12 sm:px-6 lg:px-8">
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
                            logoBox: 'h-12',
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
        </div>
    )
}
