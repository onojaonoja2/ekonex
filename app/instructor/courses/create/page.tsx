'use client'

import { createCourse } from '@/app/instructor/actions'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CreateCourseForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createCourse(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        }
        // Success redirects in action
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-lg rounded-2xl glass p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Create New Course</h1>
                    <p className="text-sm text-slate-400">Give your course a name to get started. You can add more details later.</p>
                </div>

                <form action={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-medium text-slate-300">
                            Course Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="e.g., Advanced React Patterns"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-medium text-slate-300">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="Short summary of what students will learn..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="price" className="text-sm font-medium text-slate-300">
                            Price (USD)
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-xs text-slate-500">Set to 0 for a free course.</p>
                    </div>

                    <div className="mt-2 flex gap-3">
                        <a href="/instructor/courses" className="flex-1 rounded-xl bg-slate-800 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</a>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
