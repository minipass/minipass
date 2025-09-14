import type { Metadata } from 'next'

interface MetadataConfig {
    title: string
    description: string
    keywords?: readonly string[]
    image?: string
    url?: string
}

export function generateMetadata({
    title,
    description,
    keywords = [],
    image = '/images/og-image.png',
    url,
}: MetadataConfig): Metadata {
    const fullTitle = title.includes('minipass') ? title : `${title} | minipass`
    const fullDescription =
        description || 'A plataforma com as menores taxas do mercado para comprar e vender ingressos.'

    return {
        title: fullTitle,
        description: fullDescription,
        keywords: [...keywords, 'minipass', 'ingressos', 'eventos', 'marketplace'],
        openGraph: {
            title: fullTitle,
            description: fullDescription,
            type: 'website',
            url: url ? `https://minipass.com.br${url}` : undefined,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: fullDescription,
            images: [image],
        },
    }
}

// Common metadata configurations
export const commonMetadata = {
    home: {
        title: 'minipass - Seu mini marketplace de ingressos',
        description:
            'A plataforma com as menores taxas do mercado para comprar e vender ingressos. Apenas 2% de taxa para vendedores. Simples, seguro e econômico.',
        keywords: ['ingressos', 'eventos', 'marketplace', 'venda', 'compra', 'tickets', 'brasil'],
    },
    dashboard: {
        title: 'Dashboard',
        description:
            'Gerencie seus eventos e ingressos no minipass. Crie novos eventos, venda ingressos e acompanhe suas vendas.',
        keywords: ['dashboard', 'eventos', 'gerenciar', 'vendas'],
    },
    help: {
        title: 'Central de Ajuda',
        description:
            'Encontre respostas para suas dúvidas sobre o minipass. Como comprar, vender ingressos e muito mais.',
        keywords: ['ajuda', 'suporte', 'faq', 'dúvidas'],
    },
    privacy: {
        title: 'Política de Privacidade',
        description:
            'Conheça como o minipass protege e utiliza seus dados pessoais. Transparência e segurança em primeiro lugar.',
        keywords: ['privacidade', 'dados', 'proteção', 'lgpd'],
    },
    terms: {
        title: 'Termos de Serviço',
        description: 'Termos e condições de uso da plataforma minipass. Conheça seus direitos e responsabilidades.',
        keywords: ['termos', 'condições', 'uso', 'responsabilidades'],
    },
} as const
