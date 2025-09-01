// Asaas API configuration
if (!process.env.ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY is missing in environment variables')
}

if (!process.env.ASAAS_WALLET_ID) {
    throw new Error('ASAAS_WALLET_ID is missing in environment variables')
}

if (!process.env.ASAAS_WEBHOOK_SIGNATURE) {
    throw new Error('ASAAS_WEBHOOK_SIGNATURE is missing in environment variables')
}

export class Asaas {
    apiKey: string
    baseUrl: string
    walletId: string
    webhookSignature: string

    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY!
        this.baseUrl = process.env.ASAAS_BASE_URL || 'https://www.asaas.com/api/v3'
        this.walletId = process.env.ASAAS_WALLET_ID!
        this.webhookSignature = process.env.ASAAS_WEBHOOK_SIGNATURE!
    }

    async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                access_token: this.apiKey,
                ...options.headers,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                `Asaas API error: ${response.status} - ${errorData.errors?.[0]?.description || response.statusText}`,
            )
        }

        return await response.json()
    }

    verifyWebhook(signature: string): boolean {
        return signature === this.webhookSignature
    }
}

export const asaas = new Asaas()
