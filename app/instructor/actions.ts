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
}
