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
    apiUrl: string
    walletId: string
    webhookSignature: string

    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY!
        this.baseUrl = process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com'
        this.apiUrl = `${this.baseUrl}/v3`
        this.walletId = process.env.ASAAS_WALLET_ID!
        this.webhookSignature = process.env.ASAAS_WEBHOOK_SIGNATURE!
    }

    /**
     * Make a request to the Asaas API
     * @param endpoint - The endpoint to make the request to
     * @param options - The options for the request
     * @param overrideApiKey - The API key to use for the request, used when we are running a request in name of a subaccount
     * @returns The response from the Asaas API
     */
    async makeRequest(endpoint: string, options: RequestInit = {}, overrideApiKey?: string): Promise<any> {
        const url = `${this.apiUrl}${endpoint}`
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                access_token: overrideApiKey || this.apiKey,
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
