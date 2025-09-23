import { Body, Container, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'
import QRCode from 'react-qr-code'

interface Ticket {
    ticketId: string
}

interface TicketEmailProps {
    eventName: string
    eventDate: string
    eventLocation: string
    tickets: Ticket[]
    customerName: string
    totalPrice: number
}

export const TicketEmailTemplate = ({
    eventName,
    eventDate,
    eventLocation,
    tickets,
    customerName,
    totalPrice,
}: TicketEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={h1}>🎫 Seus Ingressos Chegaram!</Heading>
                    </Section>

                    <Section style={content}>
                        <Text style={greeting}>Olá {customerName}!</Text>

                        <Text style={text}>
                            Parabéns! Sua compra foi confirmada e aqui estão seus ingressos para o evento:
                        </Text>

                        <Section style={eventCard}>
                            <Heading style={h2}>{eventName}</Heading>
                            <Text style={eventDetail}>📅 {eventDate}</Text>
                            <Text style={eventDetail}>📍 {eventLocation}</Text>
                            <Text style={eventDetail}>💰 R$ {totalPrice.toFixed(2)}</Text>
                            <Text style={eventDetail}>
                                🎫 {tickets.length} {tickets.length === 1 ? 'Ingresso' : 'Ingressos'}
                            </Text>
                        </Section>

                        {tickets.map((ticket, index) => (
                            <Section key={ticket.ticketId} style={ticketSection}>
                                <Heading style={h3}>Ingresso #{index + 1}</Heading>
                                <Text style={ticketId}>ID: {ticket.ticketId}</Text>

                                <Section style={qrSection}>
                                    <div style={qrCodeContainer}>
                                        <QRCode
                                            value={ticket.ticketId}
                                            size={200}
                                            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                        />
                                    </div>
                                    <Text style={qrText}>Apresente este QR Code na entrada do evento</Text>
                                </Section>
                            </Section>
                        ))}

                        <Hr style={hr} />

                        <Section style={instructions}>
                            <Heading style={h3}>Instruções Importantes:</Heading>
                            <Text style={listItem}>• Chegue com antecedência ao evento</Text>
                            <Text style={listItem}>• Apresente qualquer um dos QR Codes na entrada</Text>
                            <Text style={listItem}>• Mantenha este email salvo no seu celular</Text>
                            <Text style={listItem}>• Em caso de dúvidas, entre em contato conosco</Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footer}>Obrigado por escolher nossa plataforma! Divirta-se no evento! 🎉</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
}

const header = {
    padding: '32px 24px 0',
    textAlign: 'center' as const,
}

const h1 = {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    padding: '0',
}

const content = {
    padding: '0 24px',
}

const greeting = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
}

const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
}

const eventCard = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
}

const h2 = {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
}

const eventDetail = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '8px 0',
}

const ticketSection = {
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
}

const h3 = {
    color: '#92400e',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
}

const ticketId = {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 24px 0',
    fontFamily: 'monospace',
}

const qrSection = {
    margin: '24px 0',
}

const qrCodeContainer = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto',
    width: '200px',
    height: '200px',
    backgroundColor: '#ffffff',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
}

const qrText = {
    color: '#92400e',
    fontSize: '14px',
    margin: '16px 0 0 0',
    fontWeight: '500',
}

const instructions = {
    margin: '24px 0',
}

const listItem = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '8px 0',
}

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
}

const footer = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '24px 0 0 0',
    textAlign: 'center' as const,
}
