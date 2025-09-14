import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Política de Privacidade - minipass',
    description: 'Política de privacidade do minipass - como protegemos seus dados',
}

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

            <div className="prose prose-gray max-w-none space-y-6">
                <p className="text-sm text-gray-600 mb-8">
                    <strong>Última atualização:</strong> 14/09/2025
                </p>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
                    <p>
                        Esta Política de Privacidade descreve como o minipass ("nós", "nosso" ou "a empresa") coleta,
                        usa, armazena e protege suas informações pessoais quando você utiliza nossa plataforma de compra
                        e venda de ingressos.
                    </p>
                    <p>
                        Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta
                        política.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>

                    <h3 className="text-lg font-medium mb-3">2.1 Informações Fornecidas por Você</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Nome completo e dados de contato (email, telefone)</li>
                        <li>Informações de conta (nome de usuário, senha)</li>
                        <li>Dados de pagamento (processados por terceiros seguros)</li>
                        <li>Informações de eventos e ingressos</li>
                        <li>Comunicações com outros usuários</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-3 mt-6">2.2 Informações Coletadas Automaticamente</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Endereço IP e informações do dispositivo</li>
                        <li>Dados de navegação e uso da plataforma</li>
                        <li>Cookies e tecnologias similares</li>
                        <li>Logs de acesso e atividade</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
                    <p>Utilizamos suas informações pessoais para:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Fornecer e melhorar nossos serviços</li>
                        <li>Processar transações e pagamentos</li>
                        <li>Facilitar a comunicação entre compradores e vendedores</li>
                        <li>Verificar identidades e prevenir fraudes</li>
                        <li>Enviar notificações importantes sobre sua conta</li>
                        <li>Personalizar sua experiência na plataforma</li>
                        <li>Cumprir obrigações legais e regulamentares</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
                    <p>
                        Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas
                        seguintes situações:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Com outros usuários da plataforma (apenas informações necessárias para a transação)</li>
                        <li>Com prestadores de serviços terceirizados (processamento de pagamentos, hospedagem)</li>
                        <li>Quando exigido por lei ou autoridades competentes</li>
                        <li>Para proteger nossos direitos, propriedade ou segurança</li>
                        <li>Com seu consentimento explícito</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
                        pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Criptografia de dados sensíveis</li>
                        <li>Controles de acesso rigorosos</li>
                        <li>Monitoramento contínuo de segurança</li>
                        <li>Treinamento regular da equipe</li>
                        <li>Auditorias de segurança periódicas</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos (LGPD)</h2>
                    <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                            <strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los
                        </li>
                        <li>
                            <strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados
                        </li>
                        <li>
                            <strong>Anonimização ou eliminação:</strong> Solicitar a exclusão de dados desnecessários
                        </li>
                        <li>
                            <strong>Portabilidade:</strong> Solicitar a transferência de seus dados
                        </li>
                        <li>
                            <strong>Eliminação:</strong> Solicitar a exclusão de dados tratados com consentimento
                        </li>
                        <li>
                            <strong>Informações:</strong> Obter informações sobre entidades com quem compartilhamos
                            dados
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Cookies e Tecnologias Similares</h2>
                    <p>
                        Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da
                        plataforma e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas
                        configurações do seu navegador.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
                    <p>
                        Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos
                        descritos nesta política, cumprir obrigações legais ou resolver disputas. Dados de transações
                        podem ser mantidos por períodos mais longos conforme exigido por lei.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Menores de Idade</h2>
                    <p>
                        Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente
                        informações pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor,
                        tomaremos medidas para excluir essas informações.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
                    <p>
                        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças
                        significativas através de email ou aviso na plataforma. Recomendamos revisar esta política
                        regularmente.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="mb-4">
                            Para questões sobre esta Política de Privacidade ou para exercer seus direitos, entre em
                            contato conosco:
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <strong>Email:</strong> privacidade@minipass.com.br
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
