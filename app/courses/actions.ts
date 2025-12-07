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
    revalidatePath(`/courses/${courseId}`)
}

export async function submitQuiz(quizId: string, courseId: string, formValues: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // 1. Fetch correct answers from DB (secure, server-side)
    const { data: questions } = await supabase
        .from('questions')
        .select('id, answers(id, is_correct)')
        .eq('quiz_id', quizId)

    if (!questions) return { error: 'Quiz not found' }

    // 2. Calculate score
    let score = 0
    let totalQuestions = questions.length

    questions.forEach(q => {
        const userAnswerId = formValues[q.id]
        const correctAnswer = q.answers.find(a => a.is_correct)

        if (correctAnswer && userAnswerId === correctAnswer.id) {
            score++
        }
    })

    const isPassed = (score / totalQuestions) >= 0.7 // 70% passing score hardcoded for MVP

    // 3. Record Attempt
    const { error } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: quizId,
        score: Math.round((score / totalQuestions) * 100),
        is_passed: isPassed
    })

    if (error) {
        console.error('Quiz Submit Error:', error)
        return { error: 'Submission failed' }
    }

    revalidatePath(`/courses/${courseId}/learn`)
    return { success: true, score: Math.round((score / totalQuestions) * 100), isPassed }
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
