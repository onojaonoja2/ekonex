import { createClient } from '@/utils/supabase/server'
import { initializeTransaction } from '@/utils/paystack'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { courseId } = body

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
        }

        // Unpack params properly if needed (though here we just use body)

        // Fetch course details
        const { data: course } = await supabase
            .from('courses')
            .select('price, title')
            .eq('id', courseId)
            .single()

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        if (course.price <= 0) {
            return NextResponse.json({ error: 'Course is free' }, { status: 400 })
        }

        // Check if already enrolled
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single()

        if (enrollment) {
            return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
        }

        // Initialize Paystack Transaction
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?payment=success`

        const paystackResponse = await initializeTransaction(
            user.email!,
            course.price,
            callbackUrl,
            {
                userId: user.id,
                courseId: courseId,
                custom_fields: [
                    {
                        display_name: "Course Title",
                        variable_name: "course_title",
                        value: course.title
                    }
                ]
            }
        )

        if (!paystackResponse.status) {
            return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
        }

        // Create purchase record
        const { error: purchaseError } = await supabase.from('purchases').insert({
            user_id: user.id,
            course_id: courseId,
            amount: course.price,
            reference: paystackResponse.data.reference,
            status: 'pending'
        })

        if (purchaseError) {
            console.error('Purchase creation error:', purchaseError)
            return NextResponse.json({ error: 'Failed to create purchase record' }, { status: 500 })
        }

        return NextResponse.json({
            authorizationUrl: paystackResponse.data.authorization_url,
            reference: paystackResponse.data.reference
        })

    } catch (error) {
        console.error('Payment initialization error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
