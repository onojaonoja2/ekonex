import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LessonEditorForm from './lesson-editor-form'

export default async function LessonEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { id } = await params

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*, module:modules(course_id)')
        .eq('id', id)
        .single()

    if (!lesson) return <div>Lesson not found</div>

    // Verify ownership (via RLS mostly, but double check course owner)
    const { data: course } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', lesson.module.course_id)
        .single()

    if (course?.instructor_id !== user.id) {
        return <div>Unauthorized</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href={`/instructor/courses/${lesson.module.course_id}`} className="text-sm text-slate-400 hover:text-indigo-400 mb-2 inline-block">
                        &larr; Back to Course
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Edit Lesson: {lesson.title}</h1>
                </div>

                <div className="glass rounded-2xl p-6 border border-slate-800">
                    <LessonEditorForm lesson={lesson} />
                </div>
            </div>
        </div>
    )
}
