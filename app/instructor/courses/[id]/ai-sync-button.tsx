'use client'

import { useState } from 'react'
import { generateCourseEmbeddings } from '@/app/instructor/ai-actions'
import { toast } from 'sonner'

export default function AiSyncButton({ courseId }: { courseId: string }) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSync() {
        setIsLoading(true)
        const toastId = toast.loading('Generating AI embeddings...')

        try {
            const res = await generateCourseEmbeddings(courseId)

            if (res?.error) {
                toast.error(res.error, { id: toastId })
            } else if (res?.message) {
                toast.info(res.message, { id: toastId })
            } else if (res?.success) {
                toast.success(`Successfully indexed ${res.count} lessons!`, { id: toastId })
            }
        } catch (e) {
            toast.error('Something went wrong', { id: toastId })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleSync}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 px-3 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 disabled:opacity-50 transition-all"
        >
            {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            {isLoading ? 'Indexing...' : 'Sync AI Tutor'}
        </button>
    )
}
