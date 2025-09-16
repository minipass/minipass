'use client'

import { SignIn } from '@clerk/nextjs'

import { useDarkModeValue } from '@/hooks/useDarkModeValue'
import darkLogo from '@/images/minipass-dark.svg'
import lightLogo from '@/images/minipass.svg'

// Extracted to a separate component to guarantee only this one is a client component while main Signin page is static
export const SignInComponent = () => {
    const logo = useDarkModeValue(lightLogo, darkLogo)

    return (
        <SignIn
            appearance={{
                layout: {
                    logoImageUrl: logo?.src,
                    helpPageUrl: '/help',
                    privacyPageUrl: '/privacy',
                    termsPageUrl: '/terms',
                },
                elements: {
                    formButtonPrimary:
                        'bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 text-sm normal-case border-none',
                    logoBox: 'h-12',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formFieldInput: 'border border-gray-300 focus:border-primary focus:ring-primary',
                },
            }}
            fallbackRedirectUrl="/"
            signUpUrl="/sign-up"
        />
    )
}
