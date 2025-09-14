import { ptBR } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import Header from '@/components/Header'
import SyncUserWithConvex from '@/components/SyncUserWithConvex'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/css'

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
    title: {
        default: 'minipass - Seu mini marketplace de ingressos',
        template: '%s | minipass',
    },
    description:
        'A plataforma com as menores taxas do mercado para comprar e vender ingressos. Apenas 2% de taxa para vendedores. Simples, seguro e econômico.',
    keywords: ['ingressos', 'eventos', 'marketplace', 'venda', 'compra', 'tickets', 'brasil'],
    authors: [
        { name: 'minipass', url: 'https://minipass.com.br' },
        { name: 'Rafael Audibert', url: 'https://rafaaudibert.dev' },
    ],
    creator: 'minipass',
    publisher: 'minipass',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://minipass.com.br'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://minipass.com.br',
        title: 'minipass - Seu mini marketplace de ingressos',
        description:
            'A plataforma com as menores taxas do mercado para comprar e vender ingressos. Apenas 2% de taxa para vendedores. Simples, seguro e econômico.',
        siteName: 'minipass',
        images: [
            {
                url: '/images/og-image.png',
                width: 1200,
                height: 630,
                alt: 'minipass - Marketplace de ingressos com as menores taxas',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'minipass - Seu mini marketplace de ingressos',
        description:
            'A plataforma com as menores taxas do mercado para comprar e vender ingressos. Apenas 2% de taxa para vendedores.',
        images: ['/images/og-image.png'],
        creator: '@minipass',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
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
        <html lang="pt-BR">
            <body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
                <ClerkProvider localization={ptBR} appearance={{ baseTheme: 'simple' }}>
                    <ConvexClientProvider>
                        <SyncUserWithConvex />
                        <Header />
                        {children}

                        <Toaster />
                    </ConvexClientProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
