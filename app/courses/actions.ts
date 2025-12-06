'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function enrollInCourse(courseId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if already enrolled
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (existing) {
        redirect(`/courses/${courseId}?message=Already enrolled`)
    }

    // Create enrollment
    const { error } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: courseId,
    })

    if (error) {
        console.error('Enrollment Error:', error)
        redirect(`/courses/${courseId}?error=Could not enroll in course`)
    }

    revalidatePath('/courses')
    revalidatePath(`/courses/${courseId}`)
    redirect(`/courses/${courseId}`)
}
