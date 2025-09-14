import { commonMetadata, generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata(commonMetadata.terms)

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Termos de Serviço</h1>

            <div className="prose prose-gray max-w-none space-y-6">
                <p className="text-sm text-primary mb-8">
                    <strong>Última atualização:</strong> 14/09/2025
                </p>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                    <p>
                        Bem-vindo ao minipass! Estes Termos de Serviço ("Termos") regem o uso da plataforma minipass
                        ("Plataforma", "Serviço") operada por nossa empresa ("nós", "nosso" ou "a empresa").
                    </p>
                    <p>
                        Ao acessar ou usar nossa Plataforma, você concorda em ficar vinculado a estes Termos. Se você
                        não concordar com qualquer parte destes termos, não deve usar nosso Serviço.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
                    <p>
                        O minipass é uma plataforma online que facilita a compra e venda de ingressos para eventos.
                        Nossa Plataforma conecta vendedores e compradores de ingressos, fornecendo um ambiente seguro
                        para transações.
                    </p>
                    <p>
                        <strong>Importante:</strong> Somos apenas uma plataforma intermediária. Não somos responsáveis
                        pela autenticidade dos ingressos ou pela realização dos eventos.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Elegibilidade</h2>
                    <p>Para usar nossa Plataforma, você deve:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Ter pelo menos 18 anos de idade</li>
                        <li>Ter capacidade legal para celebrar contratos</li>
                        <li>Fornecer informações verdadeiras e precisas</li>
                        <li>Manter a confidencialidade de sua conta</li>
                        <li>Ser responsável por todas as atividades em sua conta</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Contas de Usuário</h2>
                    <h3 className="text-lg font-medium mb-3">4.1 Criação de Conta</h3>
                    <p>
                        Para usar certos recursos da Plataforma, você deve criar uma conta. Você é responsável por
                        manter a confidencialidade de suas credenciais de login.
                    </p>

                    <h3 className="text-lg font-medium mb-3 mt-6">4.2 Responsabilidades do Usuário</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Fornecer informações precisas e atualizadas</li>
                        <li>Notificar-nos imediatamente sobre uso não autorizado</li>
                        <li>Ser responsável por todas as atividades em sua conta</li>
                        <li>Não compartilhar suas credenciais com terceiros</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Uso da Plataforma</h2>
                    <h3 className="text-lg font-medium mb-3">5.1 Uso Permitido</h3>
                    <p>Você pode usar nossa Plataforma para:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Comprar ingressos para eventos</li>
                        <li>Vender ingressos que você possui legalmente</li>
                        <li>Comunicar-se com outros usuários sobre transações</li>
                        <li>Acessar informações sobre eventos</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-3 mt-6">5.2 Uso Proibido</h3>
                    <p>Você não pode:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Vender ingressos falsos ou inválidos</li>
                        <li>Usar a Plataforma para atividades ilegais</li>
                        <li>Interferir no funcionamento da Plataforma</li>
                        <li>Violar direitos de propriedade intelectual</li>
                        <li>Enviar spam ou conteúdo ofensivo</li>
                        <li>Criar contas falsas ou múltiplas</li>
                        <li>Manipular preços ou criar concorrência desleal</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Transações e Pagamentos</h2>
                    <h3 className="text-lg font-medium mb-3">6.1 Processamento de Pagamentos</h3>
                    <p>
                        Utilizamos processadores de pagamento terceirizados seguros. Todas as transações são processadas
                        de acordo com os termos dos processadores de pagamento.
                    </p>

                    <h3 className="text-lg font-medium mb-3 mt-6">6.2 Taxas da Plataforma</h3>
                    <p>
                        Cobramos uma taxa de 2% sobre cada venda realizada na Plataforma. Esta taxa é reduzida para
                        vendedores com maior volume de vendas. As taxas serão claramente comunicadas antes da conclusão
                        da transação.
                    </p>

                    <h3 className="text-lg font-medium mb-3 mt-6">6.3 Impostos e Obrigações Fiscais</h3>
                    <div className="bg-primary/10 p-4 rounded-sm">
                        <p className="mb-3">
                            <strong>Responsabilidade Fiscal:</strong> Todos os usuários são responsáveis por cumprir
                            suas obrigações fiscais de acordo com a legislação brasileira vigente.
                        </p>

                        <h4 className="font-medium mb-2">Para Vendedores:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                            <li>Você é responsável por declarar suas vendas e pagar os impostos devidos</li>
                            <li>Deve emitir notas fiscais quando aplicável</li>
                            <li>Deve cumprir as obrigações do MEI, ME ou EPP conforme seu regime tributário</li>
                            <li>
                                É responsável por calcular e recolher ICMS, ISS e outros impostos municipais/estaduais
                            </li>
                        </ul>

                        <h4 className="font-medium mb-2">Para Compradores:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                            <li>Os preços exibidos incluem todos os impostos aplicáveis</li>
                            <li>Você receberá comprovantes de pagamento para suas declarações</li>
                            <li>É responsável por manter os comprovantes para fins fiscais</li>
                        </ul>

                        <p className="text-sm text-primary">
                            <strong>Importante:</strong> O minipass não atua como substituto tributário. Cada usuário
                            deve consultar um contador ou advogado tributário para orientação específica sobre suas
                            obrigações fiscais.
                        </p>
                    </div>

                    <h3 className="text-lg font-medium mb-3 mt-6">6.4 Reembolsos</h3>
                    <p>
                        Políticas de reembolso dependem do vendedor e das circunstâncias específicas. Casos de reembolso
                        serão analisados individualmente. Impostos já recolhidos sobre transações reembolsadas seguem as
                        regras da Receita Federal.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Responsabilidades e Limitações</h2>
                    <h3 className="text-lg font-medium mb-3">7.1 Limitação de Responsabilidade</h3>
                    <p>Nossa responsabilidade é limitada ao máximo permitido por lei. Não somos responsáveis por:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Autenticidade dos ingressos vendidos</li>
                        <li>Cancelamento ou alteração de eventos</li>
                        <li>Danos indiretos ou consequenciais</li>
                        <li>Perdas de lucros ou oportunidades</li>
                        <li>Ações de terceiros</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-3 mt-6">7.2 Isenção de Garantias</h3>
                    <p>
                        A Plataforma é fornecida "como está" sem garantias de qualquer tipo. Não garantimos que o
                        serviço será ininterrupto ou livre de erros.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo da Plataforma, incluindo textos, gráficos, logotipos, imagens e software, é
                        propriedade nossa ou de nossos licenciadores e está protegido por leis de direitos autorais e
                        outras leis de propriedade intelectual.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Privacidade</h2>
                    <p>
                        Sua privacidade é importante para nós. Nossa coleta e uso de informações pessoais é regida por
                        nossa{' '}
                        <a href="/privacy" className="text-primary hover:underline">
                            Política de Privacidade
                        </a>
                        , que faz parte integrante destes Termos.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Suspensão e Encerramento</h2>
                    <p>
                        Reservamo-nos o direito de suspender ou encerrar sua conta a qualquer momento, com ou sem aviso
                        prévio, por violação destes Termos ou por qualquer outra razão a nosso critério.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Modificações dos Termos</h2>
                    <p>
                        Podemos modificar estes Termos a qualquer momento. As modificações entrarão em vigor
                        imediatamente após a publicação na Plataforma. Seu uso continuado da Plataforma constitui
                        aceitação dos Termos modificados.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">12. Lei Aplicável e Jurisdição</h2>
                    <p>
                        Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais
                        competentes do Brasil, especificamente na cidade de São Paulo, SP.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">13. Disposições Gerais</h2>
                    <h3 className="text-lg font-medium mb-3">13.1 Divisibilidade</h3>
                    <p>
                        Se qualquer disposição destes Termos for considerada inválida, as demais disposições
                        permanecerão em pleno vigor.
                    </p>

                    <h3 className="text-lg font-medium mb-3 mt-6">13.2 Acordo Integral</h3>
                    <p>Estes Termos constituem o acordo integral entre você e nós em relação ao uso da Plataforma.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">14. Contato</h2>
                    <div className="bg-primary/10 p-6 rounded-sm">
                        <p className="mb-4">
                            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <strong>Email:</strong> legal@minipass.com.br
                            </li>
                            <li>
                                <strong>Endereço:</strong> Rua General João Telles, 393 - Porto Alegre, RS
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
}
