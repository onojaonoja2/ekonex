'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCourse } from '@/app/instructor/actions'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return
        }

        setIsLoading(true)
        try {
            const result = await deleteCourse(courseId)
            if (result.error) {
                alert(result.error)
            } else {
                router.push('/instructor/courses')
                router.refresh()
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
        >
            {isLoading ? 'Deleting...' : 'Delete Course'}
        </button>
    )
}
