import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileDropdown from '@/components/profile-dropdown'
import DeleteCourseButton from '@/app/instructor/courses/[id]/delete-course-button'
import PublishButton from '@/app/instructor/courses/[id]/publish-button'

export default async function InstructorDashboard() {
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

    // Redirect if not instructor
    if (profile?.role !== 'instructor') {
        redirect('/student/dashboard')
    }

    // Fetch Courses
    const { data: courses } = await supabase
        .from('courses')
        .select('*, enrollments(count)')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })

    const totalStudents = courses?.reduce((acc, course) => acc + (course.enrollments?.[0]?.count || 0), 0) || 0
    const totalCourses = courses?.length || 0

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                            Instructor Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage your courses and view your performance.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: Profile & Simple Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass rounded-2xl p-6 text-center border border-slate-800">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                                {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <h3 className="font-semibold text-lg text-white">{profile?.full_name || 'Instructor'}</h3>
                            <p className="text-sm text-slate-500 mb-6">{user.email}</p>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalCourses}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Courses</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-400">{totalStudents}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Students</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6 border border-slate-800">
                            <h4 className="font-semibold text-white mb-4">Quick Actions</h4>
                            <Link href="/instructor/courses/create" className="flex items-center justify-center w-full gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Create New Course
                            </Link>
                        </div>
                    </div>

                    {/* Main Content: Courses List */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Your Courses</h2>
                        </div>

                        <div className="space-y-4">
                            {courses && courses.length > 0 ? (
                                courses.map((course) => (
                                    <div key={course.id} className="glass rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all hover:bg-slate-800/30">
                                        <div className="h-20 w-32 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700">
                                            {course.cover_image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-slate-600">{course.title[0]}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg text-white truncate">{course.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${course.is_published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                                                    {course.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-1 mb-2">{course.description || 'No description'}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                    {course.enrollments?.[0]?.count || 0} Students
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <Link href={`/instructor/courses/${course.id}`} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                                                Manage
                                            </Link>
                                            <PublishButton courseId={course.id} isPublished={course.is_published} />
                                            {/* We rely on the button component style inside PublishButton but it might need adjusting as it usually has its own style. 
                                                Actually PublishButton has fixed styles. Let's check if we can pass className or if it fits. 
                                                It has relative wide padding. */}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 glass rounded-2xl border border-dashed border-slate-800">
                                    <p className="text-slate-400 mb-4">You haven't created any courses yet.</p>
                                    <Link href="/instructor/courses/create" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                        Create your first course &rarr;
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
