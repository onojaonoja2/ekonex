'use client'

import { useState } from 'react'
import { createModule, createLesson } from '@/app/instructor/actions'
import { toast } from 'sonner'

type Lesson = {
    id: string
    title: string
    content_type: 'video' | 'text'
    is_free_preview: boolean
}

type Module = {
    id: string
    title: string
    lessons: Lesson[]
}

export default function ModulesList({ courseId, modules }: { courseId: string, modules: Module[] }) {
    const [isAddingModule, setIsAddingModule] = useState(false)
    const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null)

    async function handleAddModule(formData: FormData) {
        const result = await createModule(courseId, formData)
        if (result?.error) toast.error(result.error)
        else {
            toast.success('Module added')
            setIsAddingModule(false)
        }
    }

    async function handleAddLesson(moduleId: string, formData: FormData) {
        const result = await createLesson(moduleId, courseId, formData)
        if (result?.error) toast.error(result.error)
        else {
            toast.success('Lesson added')
            setAddingLessonToModule(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Course Content</h2>
                <button onClick={() => setIsAddingModule(true)} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                    + Add Module
                </button>
            </div>

            {isAddingModule && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">New Module</h3>
                    <form action={handleAddModule} className="flex gap-2">
                        <input name="title" required placeholder="Module Title (e.g. Introduction)" className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
                        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Save</button>
                        <button type="button" onClick={() => setIsAddingModule(false)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="rounded-xl border border-slate-700 bg-slate-900/30 overflow-hidden">
                        <div className="bg-slate-900/80 p-4 flex items-center justify-between border-b border-slate-800">
                            <span className="font-semibold text-slate-200">{module.title}</span>
                            <button onClick={() => setAddingLessonToModule(module.id)} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">+ Add Lesson</button>
                        </div>

                        {addingLessonToModule === module.id && (
                            <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                                <h3 className="text-xs font-semibold uppercase text-slate-500 mb-3">New Lesson</h3>
                                <form action={(fd) => handleAddLesson(module.id, fd)} className="space-y-3">
                                    <input name="title" required placeholder="Lesson Title" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />

                                    <div className="flex gap-4">
                                        <select name="contentType" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none">
                                            <option value="text">Text / Article</option>
                                            <option value="video">Video URL</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" name="isFreePreview" id="free" className="rounded border-slate-700 bg-slate-950 text-indigo-600" />
                                            <label htmlFor="free" className="text-sm text-slate-400">Free Preview</label>
                                        </div>
                                    </div>

                                    <input name="contentUrl" placeholder="Video URL (Youtube/Vimeo) - if video selected" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
                                    <textarea name="contentText" placeholder="Lesson Content (for text lessons)" rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />

                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setAddingLessonToModule(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                                        <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Add Lesson</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="divide-y divide-slate-800">
                            {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="p-3 pl-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${lesson.content_type === 'video' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
                                                {lesson.content_type}
                                            </span>
                                            <span className="text-sm text-slate-300">{lesson.title}</span>
                                            {lesson.is_free_preview && <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 rounded-full">Free</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-600 italic">No lessons in this module yet.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {modules.length === 0 && !isAddingModule && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                    <p className="text-slate-500 mb-4">Start by adding a module to organize your content.</p>
                    <button onClick={() => setIsAddingModule(true)} className="rounded-xl bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-600/20">Add First Module</button>
                </div>
            )}
        </div>
    )
}
