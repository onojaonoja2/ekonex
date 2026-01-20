import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function InstructorCoursesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">My Courses</h1>
                        <p className="text-slate-400">Manage your content and students</p>
                    </div>
                    <Link
                        href="/instructor/courses/create"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
                    >
                        + New Course
                    </Link>
                </div>

                {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Link key={course.id} href={`/instructor/courses/${course.id}`} className="group relative block h-full">
                                <div className="h-full rounded-2xl glass p-6 transition-all duration-300 hover:bg-slate-800/50 hover:border-indigo-500/30">
                                    <div className={`h-40 w-full rounded-xl mb-4 bg-gradient-to-tr ${course.is_published ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20' : 'from-indigo-500/20 to-purple-500/20 border-indigo-500/20'} border flex items-center justify-center`}>
                                        {course.cover_image ? (
                                            <img
                                                src={course.cover_image}
                                                alt={course.title}
                                                className="h-full w-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-white/20">{course.title[0]}</span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{course.description || "No description provided."}</p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${course.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="text-sm font-medium text-slate-300">
                                            {course.price > 0 ? `$${course.price}` : 'Free'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 py-24 text-center">
                        <h3 className="text-lg font-medium text-white">No courses created yet</h3>
                        <p className="mt-1 text-sm text-slate-400">Get started by creating your first course.</p>
                        <div className="mt-6">
                            <Link
                                href="/instructor/courses/create"
                                className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Create Course
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
