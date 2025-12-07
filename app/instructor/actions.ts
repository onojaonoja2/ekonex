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
    const supabase = await createClient()

    const title = formData.get('title') as string
    const contentType = formData.get('contentType') as 'video' | 'text' || 'text'
    const contentUrl = formData.get('contentUrl') as string
    const contentText = formData.get('contentText') as string
    const isFreePreview = formData.get('isFreePreview') === 'on'

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
        console.error('Create Lesson Error:', error)
        return { error: 'Could not create lesson' }
    }

    revalidatePath(`/instructor/courses/${courseId}`)
    revalidatePath(`/instructor/courses/${courseId}`)
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

export async function createQuestion(quizId: string, formData: FormData) {
    const supabase = await createClient()
    const text = formData.get('text') as string

    const { error } = await supabase.from('questions').insert({
        quiz_id: quizId,
        text,
        points: 10
    })

    if (error) return { error: 'Could not create question' }

    revalidatePath(`/instructor/courses/*/quizzes/${quizId}`)
}

export async function createAnswer(questionId: string, quizId: string, formData: FormData) {
    const supabase = await createClient()
    const text = formData.get('text') as string
    const isCorrect = formData.get('isCorrect') === 'on'

    const { error } = await supabase.from('answers').insert({
        question_id: questionId,
        text,
        is_correct: isCorrect
    })

    if (error) return { error: 'Could not create answer' }

    revalidatePath(`/instructor/courses/*/quizzes/${quizId}`)
}

export async function deleteQuestion(questionId: string, quizId: string) {
    const supabase = await createClient()
    await supabase.from('questions').delete().eq('id', questionId)
    revalidatePath(`/instructor/courses/*/quizzes/${quizId}`)
}

