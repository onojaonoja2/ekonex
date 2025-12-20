'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCoursePublishStatus } from '@/app/instructor/actions'

interface PublishButtonProps {
    courseId: string
    isPublished: boolean
}

export default function PublishButton({ courseId, isPublished }: PublishButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const result = await toggleCoursePublishStatus(courseId, !isPublished)
            if (result.error) {
                alert(result.error)
            } else {
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
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isPublished
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
            }`}
        >
            {isLoading ? 'Updating...' : isPublished ? 'Unpublish Course' : 'Publish Course'}
        </button>
    )
}
