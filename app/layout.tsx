import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import Header from '@/components/Header'
import SyncUserWithConvex from '@/components/SyncUserWithConvex'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
})
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
})

export const metadata: Metadata = {
    title: 'minipass',
    description: 'Your mini ticket marketplace',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ConvexClientProvider>
                    <ClerkProvider>
                        <Header />
                        <SyncUserWithConvex />
                        {children}

                        <Toaster />
                    </ClerkProvider>
                </ConvexClientProvider>
            </body>
        </html>
    )
}
