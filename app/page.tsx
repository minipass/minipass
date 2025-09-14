'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowRight, Globe, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import EventListLanding from '@/components/EventListLanding'
import logo from '@/images/minipass-2lines.svg'

export default function LandingPage() {
    const { isSignedIn, isLoaded } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push('/dashboard')
        }
    }, [isLoaded, isSignedIn, router])

    // Show loading or nothing while checking auth status
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    // Don't render landing page if user is signed in (redirect will happen)
    if (isSignedIn) {
        return null
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                            O lugar mais barato para{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                comprar e vender
                            </span>{' '}
                            ingressos
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            A plataforma com as menores taxas do mercado. Compre ingressos com preços justos ou venda os
                            seus com apenas 2% de taxa. Simples, seguro e econômico.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/dashboard"
                                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                            >
                                Comprar ingressos
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/sign-up"
                                className="border border-border text-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
                            >
                                Vender ingressos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-20 bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">Próximos Eventos</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                            Descubra eventos incríveis e reserve seus ingressos
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                        >
                            Ver todos os eventos
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                    <EventListLanding />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Por que escolher o minipass?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            A plataforma com as menores taxas do mercado para compradores e vendedores
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-secondary p-8 rounded-xl border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Menores taxas do mercado</h3>
                            <p className="text-muted-foreground">
                                Apenas 2% para vendedores. Compre ingressos com preços justos sem taxas abusivas.
                                Transparência total nos preços.
                            </p>
                        </div>

                        <div className="bg-secondary p-8 rounded-xl border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Pagamentos seguros</h3>
                            <p className="text-muted-foreground">
                                Compre e venda com segurança. Integração com Stripe e Asaas, incluindo PIX. Transações
                                protegidas e confiáveis.
                            </p>
                        </div>

                        <div className="bg-secondary p-8 rounded-xl border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                                <Globe className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Fácil de usar</h3>
                            <p className="text-muted-foreground">
                                Interface intuitiva para comprar e vender. Encontre eventos rapidamente ou crie os seus
                                em poucos minutos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Como funciona</h2>
                        <p className="text-xl text-muted-foreground">Simples para comprar, fácil para vender</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Encontre ou crie</h3>
                            <p className="text-muted-foreground">
                                Procure eventos incríveis ou cadastre-se para vender seus ingressos
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Escolha ou configure</h3>
                            <p className="text-muted-foreground">
                                Selecione seus ingressos ou configure preços e detalhes do evento
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Pague ou receba</h3>
                            <p className="text-muted-foreground">
                                Finalize sua compra com segurança ou receba pagamentos automaticamente
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
                        Pronto para começar?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Junte-se a centenas de pessoas que já compram e vendem no minipass
                    </p>
                    <Link
                        href="/sign-up"
                        className="bg-primary-foreground text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-foreground/90 transition-colors inline-flex items-center"
                    >
                        Criar conta gratuita
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-secondary text-secondary-foreground py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/" className="flex items-center space-x-2 mb-4">
                                <Image src={logo} alt="minipass" className="h-24 w-auto" />
                            </Link>
                            <p className="text-muted-foreground mb-4 max-w-md">
                                A plataforma com as menores taxas do mercado para comprar e vender ingressos.
                                Transparência total nos preços.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Suporte</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/help"
                                        className="text-muted-foreground hover:text-secondary-foreground transition-colors"
                                    >
                                        Central de Ajuda
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="text-muted-foreground hover:text-secondary-foreground transition-colors"
                                    >
                                        Política de Privacidade
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="text-muted-foreground hover:text-secondary-foreground transition-colors"
                                    >
                                        Termos de Serviço
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Contato</h3>
                            <ul className="space-y-2">
                                <li className="text-muted-foreground">suporte@minipass.com.br</li>
                                <li className="text-muted-foreground">Segunda a sexta, 9h às 18h</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} minipass. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
