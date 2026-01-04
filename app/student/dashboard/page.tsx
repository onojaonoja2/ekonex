import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileDropdown from '@/components/profile-dropdown'

export default async function StudentDashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Redirect if instructor (optional, keeps roles strict)
    if (profile?.role === 'instructor') {
        redirect('/instructor/dashboard')
    }

    // Fetch enrolled courses
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)

    // START: Progress Calculation Logic
    const courseIds = enrollments?.map(e => e.course_id) || []

    // Fetch all lessons for these courses to determine total count
    const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, modules!inner(course_id)')
        .in('modules.course_id', courseIds)

    // Fetch user's completed lessons
    const { data: userProgress } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true)

    const progressMap: Record<string, number> = {}

    enrollments?.forEach(enrollment => {
        const courseId = enrollment.course_id
        // Filter lessons belonging to this course
        // @ts-ignore
        const courseLessons = allLessons?.filter((l: any) => l.modules?.course_id === courseId) || []
        const totalLessons = courseLessons.length

        if (totalLessons === 0) {
            progressMap[courseId] = 0
        } else {
            const completedCount = courseLessons.filter((l: any) =>
                userProgress?.some(p => p.lesson_id === l.id)
            ).length
            progressMap[courseId] = Math.round((completedCount / totalLessons) * 100)
        }
    })
    // END: Progress Calculation Logic

    // Fetch certificates
    const { data: certificates } = await supabase
        .from('certificates')
        .select('id, course_id')
        .eq('user_id', user.id)

    const certificateMap = new Map(certificates?.map(c => [c.course_id, c.id]))

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex justify-end mb-4 md:hidden">
                    {/* Mobile profile dropdown if needed, though usually in layout */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass rounded-2xl p-6 text-center border border-slate-800">
                            {profile?.avatar_url ? (
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-800 mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <h3 className="font-semibold text-lg text-white">{profile?.full_name || 'Student'}</h3>
                            <p className="text-sm text-slate-500 mb-6">{user.email}</p>

                            <div className="border-t border-slate-800 pt-6 mt-6">
                                <Link href="/profile" className="block w-full rounded-xl bg-slate-800 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content / Enrolled Courses */}
                    <div className="lg:col-span-3">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                                My Learning
                            </h1>
                            <p className="text-slate-400 mt-2">
                                Continue where you left off.
                            </p>
                        </div>

                        {enrollments && enrollments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollments.map((enrollment) => {
                                    const progress = progressMap[enrollment.course_id] || 0
                                    const certificateId = certificateMap.get(enrollment.course_id)
                                    const canClaim = progress === 100 && !certificateId

                                    return (
                                        <div key={enrollment.id} className="block group h-full">
                                            <div className="glass h-full rounded-xl p-4 flex flex-col gap-4 transition-all hover:bg-slate-800/60 hover:scale-[1.01] border border-slate-800 relative">
                                                {/* Course Image Placeholder */}
                                                <Link href={`/courses/${enrollment.course_id}/learn`} className="block">
                                                    <div className="h-40 w-full bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700 relative">
                                                        {enrollment.courses.cover_image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={enrollment.courses.cover_image} alt={enrollment.courses.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-4xl font-bold text-slate-600">{enrollment.courses.title[0]}</span>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                                    </div>
                                                </Link>

                                                <div className="flex-1 flex flex-col">
                                                    <Link href={`/courses/${enrollment.course_id}/learn`} className="block flex-1">
                                                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors mb-2">{enrollment.courses.title}</h3>
                                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{enrollment.courses.description || 'No description'}</p>
                                                    </Link>

                                                    {/* Progress Bar */}
                                                    <div className="mt-auto">
                                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                            <span>Progress</span>
                                                            <span>{progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                                                            <div
                                                                className="h-full bg-emerald-500"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>

                                                        {progress === 100 && (
                                                            <Link
                                                                href={`/courses/${enrollment.course_id}/certificate`}
                                                                className="flex items-center justify-center gap-2 w-full py-1.5 mt-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                                View Certificate
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="glass rounded-2xl p-12 text-center border-dashed border-slate-800">
                                <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                                <p className="text-slate-400 mb-6">Start your learning journey today.</p>
                                <Link href="/#courses" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                                    Browse Courses
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
