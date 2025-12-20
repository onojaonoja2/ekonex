import { createClient } from '@/utils/supabase/server'
import { markLessonComplete } from '@/app/courses/actions'
import { redirect } from 'next/navigation'

export default async function LessonPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
    const supabase = await createClient()
    const { id: courseId, lessonId } = await params
    console.log('Rendering Lesson Page:', lessonId)

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

    if (!lesson) {
        return <div>Lesson not found</div>
    }

    // Bind server action
    const completeAction = markLessonComplete.bind(null, lesson.id, courseId)

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 bg-black flex items-center justify-center relative group">
                {lesson.content_type === 'video' && lesson.content_url ? (
                    <iframe
                        src={lesson.content_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full absolute inset-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="max-w-3xl mx-auto p-12 text-slate-300 prose prose-invert">
                        <h1>{lesson.title}</h1>
                        <div className="whitespace-pre-wrap">{lesson.content_text}</div>
                    </div>
                )}
            </div>

            <div className="h-20 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-8">
                <div className="text-sm text-slate-400">
                    {lesson.content_type === 'video' ? 'Video Lesson' : 'Article'}
                </div>
                <form action={completeAction}>
                    <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                        Mark as Complete
                    </button>
                </form>
            </div>
        </div>
    )
}
