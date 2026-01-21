import { createClient } from '@/utils/supabase/server'
import { BookOpen, User, DollarSign } from 'lucide-react'
import CourseActions from './course-actions'

export default async function AdminCoursesPage() {
    const supabase = await createClient()

    const { data: courses } = await supabase
        .from('courses')
        .select(`
            *,
            profiles:instructor_id (full_name, email)
        `)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Course Management</h1>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {courses?.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {course.cover_image ? (
                                                <img src={course.cover_image} alt={course.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <BookOpen size={20} className="text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white line-clamp-1">{course.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{course.description || 'No description'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        <span>{(course.profiles as any)?.full_name || 'Unknown Instructor'}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 ml-6">{(course.profiles as any)?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-slate-300">
                                        <DollarSign size={14} />
                                        {course.price > 0 ? course.price : 'Free'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${course.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </span>
                                        {course.is_paused && (
                                            <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                                                Paused
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <CourseActions course={course} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!courses?.length && (
                    <div className="p-8 text-center text-slate-500">No courses found.</div>
                )}
            </div>
        </div>
    )
}
