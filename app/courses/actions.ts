'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from '@/app/notifications/actions'

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

    // Notify Student
    await createNotification(
        user.id,
        'Enrolled Successfully',
        'You have successfully enrolled in the course. Happy learning!',
        'success'
    )
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

    if (isPassed) {
        await createNotification(
            user.id,
            'Quiz Passed! 🎉',
            `Congratulations! You passed the quiz with a score of ${Math.round((score / totalQuestions) * 100)}%.`,
            'success'
        )
    }

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
    }, {
        onConflict: 'user_id, lesson_id'
    })

    if (error) {
        console.error('Progress Error:', error)
        return
    }

    // Check for Course Completion
    // 1. Get all lesson IDs for this course
    const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id, modules!inner(course_id)')
        .eq('modules.course_id', courseId)

    if (!courseLessons) return

    // 2. Get all completed lesson IDs for this user
    const { data: completedLessons } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true)

    const completedSet = new Set(completedLessons?.map(c => c.lesson_id))

    // 3. Verify if all course lessons are in the completed set
    const allCompleted = courseLessons.every(l => completedSet.has(l.id))

    if (allCompleted) {
        // 4. Check if certificate already exists
        const { data: existingCert } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single()

        if (!existingCert) {
            // 5. Issue Certificate
            const certificateCode = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

            await supabase.from('certificates').insert({
                user_id: user.id,
                course_id: courseId,
                certificate_code: certificateCode
            })

            // Notify User
            await createNotification(
                user.id,
                'Course Completed! 🎓',
                'Congratulations! You have completed the course and earned a certificate.',
                'success'
            )
        }
    }

    revalidatePath(`/courses/${courseId}/learn`)
}
