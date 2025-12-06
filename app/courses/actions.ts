'use server'

import { revalidatePath } from 'next/cache'
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

import { redirect } from 'next/navigation'

export async function markLessonComplete(lessonId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString()
    })

    if (error) console.error('Progress Error:', error)

    revalidatePath(`/courses/${courseId}/learn`)
}
