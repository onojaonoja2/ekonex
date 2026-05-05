export const PAYSTACK_API_URL = 'https://api.paystack.co'

export interface PaystackInitializeResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
}

export interface PaystackVerifyResponse {
    status: boolean
    message: string
    data: {
        id: number
        domain: string
        status: string
        reference: string
        amount: number
        gateway_response: string
        paid_at: string
        channel: string
        currency: string
        ip_address: string
        metadata: any
        customer: {
            id: number
            first_name: string | null
            last_name: string | null
            email: string
            customer_code: string
            phone: string | null
            metadata: any | null
            risk_action: string
        }
    }
}

export async function initializeTransaction(
    email: string,
    amount: number,
    callbackUrl: string,
    metadata: any = {}
): Promise<PaystackInitializeResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
        throw new Error('PAYSTACK_SECRET_KEY is not defined')
    }

    // Paystack expects amount in kobo (x100)
    const amountInKobo = Math.round(amount * 100)

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount: amountInKobo,
            callback_url: callbackUrl,
            metadata: JSON.stringify(metadata),
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error('Paystack initialization failed:', errorBody)
        throw new Error(`Paystack initialization failed: ${response.statusText}`)
    }

    return response.json()
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
        throw new Error('PAYSTACK_SECRET_KEY is not defined')
    }

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error('Paystack verification failed:', errorBody)
        throw new Error(`Paystack verification failed: ${response.statusText}`)
    }

    return response.json()
}
