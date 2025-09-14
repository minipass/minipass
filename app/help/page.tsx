import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ajuda - minipass',
    description: 'Central de ajuda do minipass - seu mini marketplace de ingressos',
}

export default function HelpPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Central de Ajuda</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Como Funciona o minipass</h2>
                    <div className="prose prose-gray max-w-none">
                        <p className="mb-4">
                            O minipass é uma plataforma que conecta vendedores e compradores de ingressos para eventos.
                            Nossa missão é facilitar a compra e venda de ingressos de forma segura e confiável.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Para Compradores</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Como Comprar Ingressos</h3>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Navegue pelos eventos disponíveis na página inicial</li>
                                <li>Use a barra de pesquisa para encontrar eventos específicos</li>
                                <li>Clique no evento desejado para ver os detalhes</li>
                                <li>Selecione a quantidade de ingressos e clique em "Comprar"</li>
                                <li>Complete o processo de pagamento</li>
                                <li>Receba seus ingressos por email</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Meus Ingressos</h3>
                            <p>
                                Acesse a seção "Meus Ingressos" para visualizar todos os ingressos que você comprou. Lá
                                você pode ver os detalhes do evento, data, local e status do ingresso.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Importante: Verificação de Vendedores</h3>
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="mb-3">
                                    <strong>Atenção:</strong> O minipass não realiza verificação prévia dos vendedores
                                    na plataforma. É responsabilidade do comprador verificar a legitimidade do vendedor
                                    antes de realizar a compra.
                                </p>
                                <p className="mb-3">
                                    <strong>Recomendações para compradores:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Verifique o perfil e histórico do vendedor</li>
                                    <li>Leia as avaliações e comentários de outros compradores</li>
                                    <li>Entre em contato com o vendedor antes da compra</li>
                                    <li>Peça comprovantes de autenticidade dos ingressos</li>
                                    <li>Use apenas os métodos de pagamento seguros da plataforma</li>
                                </ul>
                                <p className="mt-3 text-sm text-gray-600">
                                    <strong>Lembre-se:</strong> Compre apenas de vendedores que demonstrem ser pessoas
                                    reais e confiáveis. Em caso de dúvidas, não hesite em contatar nosso suporte.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Para Vendedores</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Como Vender Ingressos</h3>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Faça login em sua conta</li>
                                <li>Clique em "Vender Ingressos" no menu</li>
                                <li>Preencha as informações do evento</li>
                                <li>Adicione os detalhes dos ingressos (preço, quantidade, setor)</li>
                                <li>Publique o anúncio</li>
                                <li>Gerencie suas vendas na seção de vendedor</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Política de Vendas</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Você é responsável pela veracidade das informações do evento</li>
                                <li>Os ingressos devem ser válidos</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Taxas e Pagamentos</h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="mb-3">
                                    <strong>Taxa da Plataforma:</strong> Cobramos uma taxa de 2% sobre cada venda
                                    realizada. Esta taxa é reduzida para vendedores com maior volume de vendas.
                                </p>
                                <p className="mb-3">
                                    <strong>Processamento de Pagamento:</strong> Além da nossa taxa, você também pagará
                                    as taxas do processador de pagamento escolhido:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>Stripe:</strong> Taxas padrão do Stripe (cartões de crédito/débito)
                                    </li>
                                    <li>
                                        <strong>Asaas:</strong> Taxas do Asaas (inclui suporte a PIX)
                                    </li>
                                </ul>
                                <p className="mt-3 text-sm text-gray-600">
                                    <strong>Nota:</strong> Apenas o Asaas oferece suporte a pagamentos via PIX. Você
                                    pode escolher qual processador usar em suas configurações de vendedor.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Problemas Comuns</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Não consigo acessar minha conta</h3>
                            <p>
                                Verifique se você está usando o email correto. Se esqueceu sua senha, use a opção
                                "Esqueci minha senha" na página de login.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Meu ingresso não chegou</h3>
                            <p>
                                Verifique sua caixa de spam. Se ainda não recebeu, entre em contato com o vendedor
                                através da plataforma ou conosco.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Evento foi cancelado</h3>
                            <p>
                                Em caso de cancelamento, entre em contato com o vendedor para solicitar reembolso. Nossa
                                equipe pode ajudar a mediar a situação.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Contato</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="mb-4">Precisa de mais ajuda? Entre em contato conosco:</p>
                        <ul className="space-y-2">
                            <li>
                                <strong>Email:</strong> suporte@minipass.com.br
                            </li>
                            <li>
                                <strong>Horário de atendimento:</strong> Segunda a sexta, 9h às 18h
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
}
