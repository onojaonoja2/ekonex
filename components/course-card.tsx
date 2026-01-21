import Link from 'next/link'

interface CourseCardProps {
    course: {
        id: string
        title: string
        description: string | null
        price: number
        cover_image: string | null
        profiles?: {
            full_name: string | null
        } | { full_name: string | null }[] | null
    }
}

export function CourseCard({ course }: CourseCardProps) {
    // Helper to safely get the profile name
    const getInstructorName = () => {
        if (!course.profiles) return 'Instructor'
        if (Array.isArray(course.profiles)) {
            return course.profiles[0]?.full_name || 'Instructor'
        }
        return (course.profiles as { full_name: string | null }).full_name || 'Instructor'
    }

    const instructorName = getInstructorName()
    const instructorInitial = instructorName[0] || 'I'

    return (
        <Link href={`/courses/${course.id}`} className="group block h-full">
            <div className="h-full rounded-2xl glass p-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 bg-slate-900/50 border border-slate-800">
                <div className={`h-48 w-full bg-gradient-to-tr ${course.cover_image ? '' : 'from-indigo-600 to-violet-600'} flex items-center justify-center relative overflow-hidden`}>
                    {course.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={course.cover_image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <span className="text-4xl font-bold text-white/30">{course.title[0]}</span>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">Course</span>
                        <span className="font-bold text-emerald-400 font-display">{course.price > 0 ? `₦${course.price}` : 'Free'}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">{course.description || 'No description available.'}</p>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-800">
                            {instructorInitial}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{instructorName}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
