import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ChatWidget from './chat-widget'

export default async function LearnLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { id: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { id } = await params

    // Fetch course details
    const { data: course } = await supabase
        .from('courses')
        .select('title, id')
        .eq('id', id)
        .single()

    if (!course) {
        return <div>Course not found</div>
    }

    // Fetch modules and lessons
    const { data: modules } = await supabase
        .from('modules')
        .select('*, lessons(id, title, position, is_free_preview), quizzes(id, title)')
        .eq('course_id', id)
        .order('position', { ascending: true })

    // Fetch user progress
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id, is_completed')
        .eq('user_id', user.id)

    const completedLessonIds = new Set(progressData?.filter(p => p.is_completed).map(p => p.lesson_id))

    return (
        <div className="flex max-h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto flex flex-col max-h-screen">
                <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                    <Link href="/learning" className="text-xs text-slate-400 hover:text-white mb-2 block">&larr; Back to Dashboard</Link>
                    <h2 className="font-bold text-lg line-clamp-2">{course.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {modules?.map((module) => (
                        <div key={module.id}>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{module.title}</h3>
                            <div className="space-y-1">
                                {module.lessons?.sort((a: any, b: any) => a.position - b.position).map((lesson: any) => {
                                    const isCompleted = completedLessonIds.has(lesson.id)
                                    return (
                                        <Link
                                            key={lesson.id}
                                            href={`/courses/${id}/learn/lessons/${lesson.id}`}
                                            className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors hover:bg-slate-800 ${isCompleted ? 'text-slate-300' : 'text-slate-200'}`}
                                        >
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                                {isCompleted && <span className="text-[10px] font-bold text-white">✓</span>}
                                            </div>
                                            <span className="line-clamp-1">{lesson.title}</span>
                                        </Link>
                                    )
                                })}
                            </div>

                            <div className="space-y-1 mt-1">
                                {module.quizzes?.map((quiz: any) => {
                                    return (
                                        <Link
                                            key={quiz.id}
                                            href={`/courses/${id}/learn/quizzes/${quiz.id}`}
                                            className="flex items-center gap-3 p-2 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-200"
                                        >
                                            <div className="h-4 w-4 rounded-full border border-emerald-600/50 bg-emerald-500/10 flex items-center justify-center text-[8px] font-bold text-emerald-500">
                                                Q
                                            </div>
                                            <span className="line-clamp-1">{quiz.title}</span>
                                        </Link>
                                    )
                                })}
                            </div>

                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                {children}
            </main>

            {/* Chat Widget */}
            <ChatWidget courseId={id} />
        </div>
    )
}
