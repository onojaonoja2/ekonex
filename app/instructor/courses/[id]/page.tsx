import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ModulesList from './modules-list'

export default async function InstructorCourseDashboard({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { id } = await params

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (!course) {
        return <div className="p-20 text-center text-white">Course not found</div>
    }

    // Fetch modules with nested lessons and quizzes
    const { data: modules } = await supabase
        .from('modules')
        .select('*, lessons(*), quizzes(*)')
        .eq('course_id', id)
        .order('position', { ascending: true })

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/instructor/courses" className="text-sm text-slate-400 hover:text-indigo-400 mb-2 inline-block">
                            &larr; Back to Courses
                        </Link>
                        <h1 className="text-3xl font-bold font-display text-white">{course.title}</h1>
                        <p className="text-slate-400">Manage your course content and settings</p>
                    </div>
                    <div className="flex gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${course.is_published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                            {course.is_published ? 'Published' : 'Draft'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl glass p-6 border border-slate-800">
                            <ModulesList courseId={course.id} modules={modules || []} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl glass p-6 border border-slate-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Course Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Price</label>
                                    <p className="text-slate-300 font-medium">{course.price > 0 ? `$${course.price}` : 'Free'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                                    <p className="text-slate-300 text-sm line-clamp-3">{course.description || 'No description'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
