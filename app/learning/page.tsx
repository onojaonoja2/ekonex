import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function MyLearningPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch enrollments with course details
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold font-display text-white mb-2">My Learning</h1>
                <p className="text-slate-400 mb-8">Courses you are currently enrolled in.</p>

                {enrollments && enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => {
                            const course = enrollment.courses as any // Type assertion for MVP
                            return (
                                <Link key={enrollment.id} href={`/courses/${course.id}`} className="group block h-full">
                                    <div className="h-full rounded-2xl glass p-6 transition-all duration-300 hover:bg-slate-800/50 hover:border-indigo-500/30">
                                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                                        <p className="mt-2 text-sm text-slate-400 line-clamp-2">{course.description}</p>
                                        <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5">
                                            <div className="bg-indigo-500 h-1.5 rounded-full w-[10%]"></div>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">10% Complete</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 py-24 text-center">
                        <h3 className="text-lg font-medium text-white">You haven't enrolled in any courses yet</h3>
                        <div className="mt-6">
                            <Link
                                href="/courses"
                                className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Browse Catalog
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
