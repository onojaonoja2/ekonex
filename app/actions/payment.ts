'use server'

import { createClient } from '@/utils/supabase/server'
import { verifyTransaction } from '@/utils/paystack'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from '@/app/notifications/actions'

export async function verifyPaymentAndEnroll(reference: string, courseId: string, shouldRevalidate: boolean = true) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Check if already enrolled
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (enrollment) {
        return { success: true }
    }

    try {
        // 2. Verify with Paystack
        const verification = await verifyTransaction(reference)

        if (!verification.status || verification.data.status !== 'success') {
            return { error: 'Payment verification failed' }
        }

        // 3. Update purchase record
        // We can do this safely even if webhook already did it
        const { error: purchaseError } = await supabase
            .from('purchases')
            .update({ status: 'success' })
            .eq('reference', reference)
            .eq('user_id', user.id) // Security check

        if (purchaseError) {
            console.error('Purchase update error:', purchaseError)
            // Continue anyway if the verification is valid
        }

        // 4. Enroll user
        const { error: enrollError } = await supabase.from('enrollments').insert({
            user_id: user.id,
            course_id: courseId
        })

        if (enrollError) {
            console.error('Enrollment error:', enrollError)
            // Check if it was a duplicate key error (race condition with webhook)
            if (enrollError.code === '23505') { // unique_violation
                return { success: true }
            }
            return { error: 'Failed to enroll in course' }
        }

        // Notify
        await createNotification(
            user.id,
            'Enrollment Successful',
            'Your payment was successful and you are now enrolled!',
            'success'
        )

        if (shouldRevalidate) {
            revalidatePath(`/courses/${courseId}`)
        }
        return { success: true }

    } catch (error) {
        console.error('Verification error:', error)
        return { error: 'Verification failed' }
    }
}
