import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PublishButton from './publish-button'
import DeleteCourseButton from './delete-course-button'
import ModulesList from './modules-list'
import AiSyncButton from './ai-sync-button'
import CoverImageUpload from './cover-image-upload'
import StudentAnalytics from './student-analytics'

export default async function InstructorCourseDashboard({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch enrollments
    const { data: rawEnrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('user_id, enrolled_at')
        .eq('course_id', id)
        .order('enrolled_at', { ascending: false })

    if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError)
    }

    const enrollments = rawEnrollments || []
    const userIds = enrollments.map((e: any) => e.user_id)

    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

    if (profilesError) {
        console.error('Error fetching profiles:', JSON.stringify(profilesError, null, 2))
    }

    const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]))

    // Calculate analytics
    const allLessonIds = modules?.flatMap((m: any) => m.lessons.map((l: any) => l.id)) || []
    const totalLessons = allLessonIds.length

    // Fetch progress for all enrolled users for this course
    const { data: allProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, lesson_id, completed_at, is_completed') // Changed updated_at to completed_at
        .in('lesson_id', allLessonIds)

    if (progressError) {
        console.error('Error fetching progress:', progressError)
    }

    const studentAnalytics = enrollments.map((enrollment: any) => {
        const profile = profilesMap.get(enrollment.user_id)
        const studentProgress = allProgress?.filter(p => p.user_id === enrollment.user_id) || []
        const completedCount = studentProgress.filter(p => p.is_completed).length
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

        // Find last activity
        const lastActive = studentProgress.length > 0
            ? studentProgress.reduce((latest, current) => {
                const latestDate = new Date(latest)
                const currentDate = new Date(current.completed_at)
                return currentDate > latestDate ? current.completed_at : latest
            }, studentProgress[0].completed_at)
            : null

        return {
            id: enrollment.user_id,
            name: profile?.full_name || 'Unknown User',
            email: profile?.email || 'No Email',
            enrolledAt: enrollment.enrolled_at,
            lastActive: lastActive,
            progress: progressPercent
        }
    })

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
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/courses/${course.id}/learn`}
                            className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
                        >
                            Preview Course
                        </Link>
                        <DeleteCourseButton courseId={course.id} />
                        <PublishButton courseId={course.id} isPublished={course.is_published} />
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${course.is_published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                            {course.is_published ? 'Published' : 'Draft'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Modules Section */}
                        <div className="rounded-2xl glass p-6 border border-slate-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Course Content</h2>
                            <ModulesList courseId={course.id} modules={modules || []} />
                        </div>

                        {/* Student Analytics Section */}
                        <StudentAnalytics students={studentAnalytics} />
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl glass p-6 border border-slate-800">
                            <h2 className="text-lg font-semibold text-white mb-4">Course Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Cover Image</label>
                                    <CoverImageUpload courseId={course.id} url={course.cover_image} />
                                </div>

                                <AiSyncButton courseId={course.id} />


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
