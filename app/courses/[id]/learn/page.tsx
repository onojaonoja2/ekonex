import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LearnPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    // Logic to find the first uncompleted lesson, or just the first lesson
    // For MVP, simply redirect to the first lesson of the first module

    const { data: firstModule } = await supabase
        .from('modules')
        .select('lessons(id)')
        .eq('course_id', id)
        .order('position', { ascending: true })
        .limit(1)
        .single()

    const firstLesson = firstModule?.lessons?.[0]

    if (firstLesson) {
        redirect(`/courses/${id}/learn/lessons/${firstLesson.id}`)
    }

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">This course has no content yet.</p>
        </div>
    )
}
