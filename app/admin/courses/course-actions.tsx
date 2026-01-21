'use client'

import { useState } from 'react'
import { MoreHorizontal, PlayCircle, PauseCircle, Trash2, Loader2 } from 'lucide-react'
import { toggleCourseStatus, deleteCourse } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CourseActions({ course }: { course: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggleStatus = async () => {
        setIsLoading(true)
        const result = await toggleCourseStatus(course.id, course.is_paused || false)
        setIsLoading(false)
        setIsOpen(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Course ${course.is_paused ? 'resumed' : 'paused'} successfully`)
            router.refresh()
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return
        setIsLoading(true)
        const result = await deleteCourse(course.id)
        setIsLoading(false)
        setIsOpen(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Course deleted successfully')
            router.refresh()
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                        <button
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                            {course.is_paused ? <PlayCircle size={16} className="text-emerald-500" /> : <PauseCircle size={16} className="text-yellow-500" />}
                            {course.is_paused ? 'Resume Course' : 'Pause Course'}
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-slate-800"
                        >
                            <Trash2 size={16} />
                            Delete Course
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
