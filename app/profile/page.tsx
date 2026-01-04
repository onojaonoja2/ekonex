import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'
import Link from 'next/link'
import ProfileDropdown from '@/components/profile-dropdown'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch enrolled courses
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)

    // START: Progress Calculation Logic
    const courseIds = enrollments?.map(e => e.course_id) || []

    // Fetch all lessons for these courses to determine total count
    // We join with modules to get the course_id
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
        // @ts-ignore - Supabase types join mapping can be tricky, assuming structure is correct
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

    // Merge profile data with user email 
    const profileData = {
        ...profile,
        email: user.email,
    }

    return (
        <div className="min-h-screen bg-transparent p-8 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <div className="flex justify-end mb-4">
                    <ProfileDropdown
                        email={user.email!}
                        fullName={profileData.full_name}
                        role={profileData.role || 'student'}
                        avatarUrl={profileData.avatar_url}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass rounded-2xl p-6 text-center">
                            {profileData.avatar_url ? (
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-800 mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={profileData.avatar_url} alt={profileData.full_name || 'User'} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                                    {profileData.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <h3 className="font-semibold text-lg text-white">{profileData.full_name || 'User'}</h3>
                            <p className="text-sm text-slate-500 mb-6">{user.email}</p>

                            <div className="text-left border-t border-slate-700/50 pt-6 mt-6">
                                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">Account Settings</h4>
                                <ProfileForm profile={profileData} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content / Enrolled Courses */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                                My Learning
                            </h1>
                            <p className="text-slate-400 mt-2">
                                Continue where you left off.
                            </p>
                        </div>

                        {enrollments && enrollments.length > 0 ? (
                            <div className="space-y-4">
                                {enrollments.map((enrollment) => {
                                    const progress = progressMap[enrollment.course_id] || 0

                                    return (
                                        <Link key={enrollment.id} href={`/courses/${enrollment.course_id}/learn`} className="block group">
                                            <div className="glass rounded-xl p-4 flex gap-4 transition-all hover:bg-slate-800/60 hover:scale-[1.01] border border-slate-700/50">
                                                {/* Course Image Placeholder */}
                                                <div className="h-24 w-32 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    {enrollment.courses.cover_image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={enrollment.courses.cover_image} alt={enrollment.courses.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl font-bold text-slate-600">{enrollment.courses.title[0]}</span>
                                                    )}
                                                </div>

                                                <div className="flex-1 py-1">
                                                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">{enrollment.courses.title}</h3>
                                                    <p className="text-sm text-slate-400 line-clamp-2">{enrollment.courses.description || 'No description'}</p>

                                                    {/* Progress Bar */}
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium">{progress}% Complete</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="glass rounded-2xl p-12 text-center border-dashed border-slate-700">
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
