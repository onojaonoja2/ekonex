'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createCourse(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0

    const { data, error } = await supabase.from('courses').insert({
        instructor_id: user.id,
        title,
        description,
        price,
        is_published: false,
    }).select().single()

    if (error) {
        console.error('Create Course Error:', error)
        return { error: 'Could not create course' }
    }

    revalidatePath('/instructor/courses')
    redirect(`/instructor/courses/${data.id}`)
}

export async function createModule(courseId: string, formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string

    const { error } = await supabase.from('modules').insert({
        course_id: courseId,
        title,
        position: 0, // Default to top for now, real app would calculate max position
    })

    if (error) {
        console.error('Create Module Error:', error)
        return { error: 'Could not create module' }
    }

    revalidatePath(`/instructor/courses/${courseId}`)
}

export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
    try {
        const supabase = await createClient()

        const title = formData.get('title') as string
        const contentType = formData.get('contentType') as 'video' | 'text' || 'text'
        const contentUrl = formData.get('contentUrl') as string
        const contentText = formData.get('contentText') as string
        const isFreePreview = formData.get('isFreePreview') === 'on'

        // Log input for debugging
        console.log('Creating lesson:', { moduleId, courseId, title, contentType })

        const { error } = await supabase.from('lessons').insert({
            module_id: moduleId,
            title,
            content_type: contentType,
            content_url: contentUrl,
            content_text: contentText,
            is_free_preview: isFreePreview,
            position: 0
        })

        if (error) {
            console.error('Create Lesson DB Error:', error)
            return { error: 'Could not create lesson: ' + error.message }
        }

        revalidatePath(`/instructor/courses/${courseId}`)
        return { success: true }
    } catch (e) {
        console.error('Create Lesson Unexpected Error:', e)
        return { error: 'An unexpected error occurred while creating the lesson' }
    }
}

export async function createQuiz(moduleId: string, courseId: string, formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string

    const { data, error } = await supabase.from('quizzes').insert({
        module_id: moduleId,
        title,
        passing_score: 70
    }).select().single()

    if (error) {
        console.error('Create Quiz Error:', error)
        return { error: 'Could not create quiz' }
    }

    revalidatePath(`/instructor/courses/${courseId}`)
    redirect(`/instructor/courses/${courseId}/quizzes/${data.id}`)
}

export async function createQuestion(quizId: string, courseId: string, formData: FormData) {
    try {
        const supabase = await createClient()
        const text = formData.get('text') as string

        const { error } = await supabase.from('questions').insert({
            quiz_id: quizId,
            text,
            points: 10
        })

        if (error) {
            console.error('Create Question DB Error:', error)
            return { error: 'Could not create question' }
        }

        revalidatePath(`/instructor/courses/${courseId}/quizzes/${quizId}`)
        revalidatePath(`/courses/${courseId}/learn/quizzes/${quizId}`)
        return { success: true }
    } catch (e) {
        console.error('Create Question Unexpected Error:', e)
        return { error: 'An unexpected error occurred' }
    }
}

export async function createAnswer(questionId: string, quizId: string, courseId: string, formData: FormData) {
    try {
        const supabase = await createClient()
        const text = formData.get('text') as string
        const isCorrect = formData.get('isCorrect') === 'on'

        const { error } = await supabase.from('answers').insert({
            question_id: questionId,
            text,
            is_correct: isCorrect
        })

        if (error) {
            console.error('Create Answer DB Error:', error)
            return { error: 'Could not create answer' }
        }

        revalidatePath(`/instructor/courses/${courseId}/quizzes/${quizId}`)
        revalidatePath(`/courses/${courseId}/learn/quizzes/${quizId}`)
        return { success: true }
    } catch (e) {
        console.error('Create Answer Unexpected Error:', e)
        return { error: 'An unexpected error occurred' }
    }
}

export async function deleteQuestion(questionId: string, quizId: string, courseId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.from('questions').delete().eq('id', questionId).select()

        if (error) {
            console.error('Delete Question DB Error:', error)
            return { error: 'Could not delete question' }
        }

        if (!data || data.length === 0) {
            return { error: 'Could not delete question (Permission denied or record not found)' }
        }

        revalidatePath(`/instructor/courses/${courseId}/quizzes/${quizId}`)
        revalidatePath(`/courses/${courseId}/learn/quizzes/${quizId}`)
        return { success: true }
    } catch (e) {
        console.error('Delete Question Unexpected Error:', e)
        return { error: 'An unexpected error occurred' }
    }
}

export async function toggleCoursePublishStatus(courseId: string, isPublished: boolean) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('courses').update({
            is_published: isPublished
        }).eq('id', courseId)

        if (error) {
            console.error('Toggle Publish Status DB Error:', error)
            return { error: 'Could not update course status' }
        }

        revalidatePath(`/instructor/courses/${courseId}`)
        revalidatePath('/courses')
        revalidatePath('/')
        return { success: true }
    } catch (e) {
        console.error('Toggle Publish Status Unexpected Error:', e)
        return { error: 'An unexpected error occurred' }
    }
}
