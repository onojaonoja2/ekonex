import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function CourseCatalogPage() {
    const supabase = await createClient()

    // Fetch published courses
    const { data: courses } = await supabase
        .from('courses')
        .select('*, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="relative py-20 px-8 text-center bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Explore Courses</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">Master new skills with our expert-led courses. Choose from a wide range of topics.</p>
            </div>

            <div className="max-w-7xl mx-auto px-8 pb-20">
                {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <Link key={course.id} href={`/courses/${course.id}`} className="group block h-full">
                                <div className="h-full rounded-2xl glass p-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10">
                                    <div className={`h-48 w-full bg-gradient-to-tr ${course.cover_image ? '' : 'from-indigo-600 to-violet-600'} flex items-center justify-center`}>
                                        {course.cover_image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-white/30">{course.title[0]}</span>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Course</span>
                                            <span className="font-bold text-emerald-400">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-3 mb-4">{course.description}</p>

                                        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                            <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                                {(course.profiles as any)?.full_name?.[0] || 'I'}
                                            </div>
                                            <span className="text-xs text-slate-500">{(course.profiles as any)?.full_name || 'Instructor'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <h3 className="text-xl font-medium text-white">No courses available yet</h3>
                        <p className="mt-2 text-slate-400">Check back later for new content.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
