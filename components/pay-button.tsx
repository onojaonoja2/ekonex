'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PayButtonProps {
    courseId: string
    price: number
    isLoggedIn: boolean
}

export default function PayButton({ courseId, price, isLoggedIn }: PayButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        if (!isLoggedIn) {
            toast.error('Please log in to purchase this course')
            router.push(`/login?next=/courses/${courseId}`)
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Payment initialization failed')
            }

            if (data.authorizationUrl) {
                window.location.href = data.authorizationUrl
            } else {
                throw new Error('No authorization URL returned')
            }
        } catch (error: any) {
            console.error('Payment error:', error)
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                </>
            ) : (
                `Buy Now - ₦${price.toLocaleString()}`
            )}
        </button>
    )
}
