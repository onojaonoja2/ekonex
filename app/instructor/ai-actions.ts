'use server'

import { createClient } from '@/utils/supabase/server'
import { OpenAI } from 'openai'
import { revalidatePath } from 'next/cache'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function generateCourseEmbeddings(courseId: string) {
    const supabase = await createClient()

    // 1. Fetch all text lessons for the course
    const { data: lessons } = await supabase
        .from('lessons')
        .select('id, content_text, module_id')
        .eq('content_type', 'text')
        .not('content_text', 'is', null)

    // Also verify course ownership implicitly by using RLS or check manually
    // RLS on lessons select might hinder if not careful, but server client usually bypasses if service role? 
    // Wait, createClient uses user auth. So RLS applies. Instructor can see their own lessons.

    if (!lessons || lessons.length === 0) {
        return { message: 'No text lessons found to index.' }
    }

    // Filter out lessons that don't belong to this course (double check via join if needed, but for now simple check)
    // Actually, above query fetches ALL lessons. We need to filter by course_id.
    // Lessons don't have course_id, they have module_id. Modules have course_id.

    const { data: courseLessons, error } = await supabase
        .from('lessons')
        .select(`
            id, 
            content_text,
            modules!inner (course_id)
        `)
        .eq('modules.course_id', courseId)
        .eq('content_type', 'text')
        .neq('content_text', '')

    if (error) {
        console.error('Fetch Lessons Error:', error)
        return { error: 'Failed to fetch lessons' }
    }

    if (!courseLessons || courseLessons.length === 0) {
        return { message: 'No text content to index.' }
    }

    let count = 0

    // 2. Clear existing embeddings for these lessons (FULL RE-INDEX approach for MVP)
    const lessonIds = courseLessons.map(l => l.id)
    await supabase.from('embeddings').delete().in('lesson_id', lessonIds)

    // 3. Generate and Save Embeddings
    for (const lesson of courseLessons) {
        if (!lesson.content_text) continue;

        try {
            // Generate embedding
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: lesson.content_text.replaceAll('\n', ' ')
            })

            const embedding = embeddingResponse.data[0].embedding

            // Save to DB
            await supabase.from('embeddings').insert({
                lesson_id: lesson.id,
                content: lesson.content_text,
                embedding
            })

            count++
        } catch (err: any) {
            console.error(`Error embedding lesson ${lesson.id}:`, err)
            if (err?.status === 429) {
                return { error: 'Start-up AI credits exceeded. Please upgrade OpenAI plan.' }
            }
        }
    }

    revalidatePath(`/instructor/courses/${courseId}`)
    return { success: true, count }
}
