import { createClient } from '@/utils/supabase/server'
import { enrollInCourse } from '../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Unwrap params object before using it (Next.js 15+ requirement)
    const { id } = await params

    const { data: course } = await supabase
        .from('courses')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single()

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
                                <span className="text-3xl font-bold text-white">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                                {course.price > 0 && <span className="text-slate-500 text-sm ml-2 line-through">$99.99</span>}
                            </div>

                            {isEnrolled ? (
                                <div className="flex flex-col gap-4">
                                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                                        <p className="text-emerald-400 font-semibold">You are enrolled!</p>
                                    </div>
                                    <button className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition-all">
                                        Continue Learning
                                    </button>
                                </div>
                            ) : (
                                <form action={enrollAction}>
                                    <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02]">
                                        {course.price > 0 ? 'Buy Now' : 'Enroll for Free'}
                                    </button>
                                    <p className="mt-4 text-xs text-center text-slate-500">30-day money-back guarantee • Lifetime access</p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Preview (Placeholder) */}
            <div className="max-w-7xl mx-auto px-8 mt-16">
                <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden divide-y divide-slate-800">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
                                    {item}
                                </div>
                                <span className="text-slate-300 font-medium">Module {item}: Introduction to Topic</span>
                            </div>
                            <span className="text-xs text-slate-500">12:34</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
