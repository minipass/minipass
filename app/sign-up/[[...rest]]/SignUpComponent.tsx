'use client'

import { SignUp } from '@clerk/nextjs'

import { useDarkModeValue } from '@/hooks/useDarkModeValue'
import darkLogo from '@/images/minipass-dark.svg'
import lightLogo from '@/images/minipass.svg'

// Extracted to a separate component to guarantee only this one is a client component while main Signup page is static
export const SignUpComponent = () => {
    const logo = useDarkModeValue(lightLogo, darkLogo)

    return (
        <SignUp
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
                    formFieldCheckboxInput: 'border-0 focus:border-0 focus:ring-0 shadow-none',
                },
            }}
            fallbackRedirectUrl="/"
            signInUrl="/sign-in"
        />
    )
}
