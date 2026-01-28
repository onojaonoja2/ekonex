import { createClient } from '@/utils/supabase/server'
import { enrollInCourse } from '../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EnrollButton from './enroll-button'
import PayButton from '@/components/pay-button'
import { verifyPaymentAndEnroll } from '@/app/actions/payment'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function CourseDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: SearchParams
}) {
    const supabase = await createClient()

    // Unwrap params object before using it (Next.js 15+ requirement)
    const { id } = await params
    const { payment, reference } = await searchParams

    // Handle payment verification
    if (payment === 'success' && typeof reference === 'string') {
        await verifyPaymentAndEnroll(reference, id, false)
        // Clean URL but we can't do that easily in RSC without client redirect or just rendering success state
        // We'll proceed to render, assuming verifyPaymentAndEnroll handles enrollment
    }

    const { data: course } = await supabase
        .from('courses')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single()

    const { data: modules } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: true }) // Assuming created_at for order if sort_order doesn't exist yet
        .limit(3)

    if (!course) {
        return <div className="p-20 text-center text-white">Course not found</div>
    }

    // Check enrollment status
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false

    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single()
        if (enrollment) isEnrolled = true
    }

    // Server Action binding
    const enrollAction = enrollInCourse.bind(null, course.id)

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative bg-slate-900 border-b border-indigo-500/10">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="col-span-2">
                        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-6">
                            {course.price > 0 ? 'Premium Course' : 'Free Course'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-6 leading-tight">{course.title}</h1>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">{course.description}</p>

                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                {(course.profiles as any)?.full_name?.[0] || 'I'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{(course.profiles as any)?.full_name || 'Unknown Instructor'}</p>
                                <p className="text-xs text-slate-500">Instructor</p>
                            </div>
                        </div>
                    </div>

                    {/* Enrollment Card */}
                    <div className="col-span-1">
                        <div className="glass rounded-2xl p-8 sticky top-8">
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-white">{course.price > 0 ? `₦${course.price}` : 'Free'}</span>
                                {course.price > 0 && <span className="text-slate-500 text-sm ml-2 line-through">₦99.99</span>}
                            </div>

                            {isEnrolled ? (
                                <div className="flex flex-col gap-4">
                                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                                        <p className="text-emerald-400 font-semibold">You are enrolled!</p>
                                    </div>
                                    <Link href={`/courses/${id}/learn`} className="block w-full text-center rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition-all">
                                        Continue Learning
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {course.price > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            <PayButton
                                                courseId={course.id}
                                                price={course.price}
                                                isLoggedIn={!!user}
                                            />
                                        </div>
                                    ) : (
                                        <EnrollButton
                                            courseId={course.id}
                                            isLoggedIn={!!user}
                                            price={course.price}
                                            enrollAction={enrollAction}
                                        />
                                    )}
                                    <p className="mt-4 text-xs text-center text-slate-500">Lifetime access</p>
                                    {!user && (
                                        <p className="mt-3 text-xs text-center text-slate-500">
                                            Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Log in</Link>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Preview (Placeholder) */}
            <div className="max-w-7xl mx-auto px-8 mt-16">
                <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden divide-y divide-slate-800">
                    {modules && modules.length > 0 ? (
                        modules.map((module, index) => (
                            <div key={module.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm shrink-0">
                                        {index + 1}
                                    </div>
                                    <span className="text-slate-300 font-medium">{module.title}</span>
                                </div>
                                {/* <span className="text-xs text-slate-500">Video</span> */}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">No content available yet.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
