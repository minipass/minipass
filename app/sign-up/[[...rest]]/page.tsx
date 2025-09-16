import { SignUpComponent } from './SignUpComponent'

export default function SignUpPage() {
    return (
        <div className="min-h-[calc(100dvh-var(--header-height))] bg-background flex flex-col justify-center lg:py-12 sm:px-6 lg:px-8">
            <div className="mt-8 flex w-full justify-center">
                <SignUpComponent />
            </div>
        </div>
    )
}
