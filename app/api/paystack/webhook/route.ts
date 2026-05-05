import { createAdminClient } from '@/utils/supabase/admin'
import { verifyTransaction } from '@/utils/paystack'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY
        if (!secret) {
            console.error('PAYSTACK_SECRET_KEY is not defined')
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
        }

        const text = await request.text()
        const hash = crypto.createHmac('sha512', secret).update(text).digest('hex')
        const signature = request.headers.get('x-paystack-signature')

        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(text)

        // Handle 'charge.success' event
        if (event.event === 'charge.success') {
            const { reference, metadata, status } = event.data

            // Verify transaction one more time to be safe? 
            // Verification is usually done to confirm status if we didn't trust webhook entirely, 
            // but signature verification is strong. 
            // We can trust the webhook payload if signature matches.

            if (status !== 'success') {
                return NextResponse.json({ message: 'Transaction not successful' })
            }

            const supabase = createAdminClient()

            // 1. Update purchase status
            const { error: updateError } = await supabase
                .from('purchases')
                .update({ status: 'success' })
                .eq('reference', reference)

            if (updateError) {
                console.error('Failed to update purchase:', updateError)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            // 2. Enroll user in course
            // Metadata in Paystack: we sent { userId, courseId, ... } 
            // But notice in utils/paystack.ts we JSON.stringify(metadata) before sending.
            // Paystack returns metadata as an object if sent as JSON, or we might need to parse it?
            // Paystack documentation says metadata is returned as sent.
            // If we sent it as a stringified JSON inside `metadata` field of init request?
            // In utils/paystack.ts:
            // metadata: JSON.stringify(metadata) 
            // Actually Paystack `metadata` parameter can be an object directly. 
            // If we stringified it, we might get it back as a string or object depending on how Paystack handles it.
            // Let's assume standard object behavior if possible, but our util stringified it.
            // So event.data.metadata might be a string or parsed object.
            // Let's check `metadata` in event.data.

            let userId, courseId

            // We'll rely on our metadata sent: { userId, courseId }
            // If `metadata` comes back as the object we passed (before stringify? no we passed a string).
            // Wait, let's fix utils/paystack.ts to NOT stringify if keys are simple, or handle it here.
            // The `initializeTransaction` implementation: `metadata: JSON.stringify(metadata)`.
            // So Paystack receives a string. Paystack might treat this as a custom field or just a string blob.
            // Ideally we should pass an object to Paystack's metadata if the library/API supports it.
            // The `body` of the fetch is `JSON.stringify({... metadata: JSON.stringify(metadata) })`.
            // This means the `metadata` field value is a JSON string.
            // So `event.data.metadata` will likely be that string.

            // However, usually it's cleaner to send metadata as an object.
            // But since I already wrote the util to stringify, I should parse it here.

            // Actually, checking Paystack docs: "The metadata parameter is a JSON object..." 
            // If we send a string, it might be fine.

            // Let's try to parse if it's a string, or use as is if object.
            let customData = event.data.metadata
            if (typeof customData === 'string') {
                try {
                    customData = JSON.parse(customData)
                } catch (e) {
                    console.error('Failed to parse metadata', e)
                }
            }

            userId = customData?.userId
            courseId = customData?.courseId

            if (userId && courseId) {
                // Check if already enrolled to avoid duplicates
                const { data: existing } = await supabase
                    .from('enrollments')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('course_id', courseId)
                    .single()

                if (!existing) {
                    const { error: enrollError } = await supabase.from('enrollments').insert({
                        user_id: userId,
                        course_id: courseId
                    })
                    if (enrollError) {
                        console.error('Enrollment failed:', enrollError)
                    }
                }
            } else {
                console.error('Missing userId or courseId in metadata', customData)
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
