import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function Return() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                        <div className="mb-4 flex justify-center">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Account Connected!</h2>
                        <p className="text-green-100">Your Asaas account has been successfully connected</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-sm p-4">
                                <h3 className="font-medium text-green-900 mb-1">What happens next?</h3>
                                <ul className="text-sm text-green-700 space-y-2">
                                    <li>• Check your email to complete your Asaas account setup</li>
                                    <li>• Verify your account details in the email from Asaas</li>
                                    <li>• Add a PIX key in your Asaas dashboard to enable PIX payments</li>
                                    <li>• Once verified, you can create and sell tickets for events</li>
                                    <li>• Payments will be processed through your Asaas account</li>
                                    <li>• minipass will charge a tiny 2% fee on every transaction</li>
                                </ul>
                            </div>

                            <Link
                                href="/dashboard/seller/events"
                                className="flex w-full bg-primary text-primary-foreground text-center py-3 px-4 rounded-sm font-medium hover:bg-primary/90 transition-colors duration-200 items-center justify-center gap-2"
                            >
                                See My Events
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
