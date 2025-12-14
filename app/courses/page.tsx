import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CourseCard } from '@/components/course-card'

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
                            <div key={course.id} className="h-[400px]">
                                <CourseCard course={course} />
                            </div>
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
