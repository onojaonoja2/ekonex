'use client'

import { useState } from 'react'
import { createModule, createLesson, createQuiz } from '@/app/instructor/actions'
import { toast } from 'sonner'
import Link from 'next/link'

type Lesson = {
    id: string
    title: string
    content_type: 'video' | 'text'
    is_free_preview: boolean
}

type Quiz = {
    id: string
    title: string
}

type Module = {
    id: string
    title: string
    lessons: Lesson[]
    quizzes: Quiz[]
}

export default function ModulesList({ courseId, modules }: { courseId: string, modules: Module[] }) {
    const [isAddingModule, setIsAddingModule] = useState(false)
    const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null)
    const [addingQuizToModule, setAddingQuizToModule] = useState<string | null>(null)

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

    async function handleAddQuiz(moduleId: string, formData: FormData) {
        const result = await createQuiz(moduleId, courseId, formData)
        if (result?.error) toast.error(result.error)
        else {
            toast.success('Quiz created')
            setAddingQuizToModule(null)
        }
    }

    async function handleDeleteLesson(lessonId: string) {
        if (!confirm('Are you sure you want to delete this lesson?')) return
        // Simplify for now, logic to be implemented or we can implement it quickly in actions
        toast.error('Delete lesson functionality is coming soon!')
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
                            <div className="flex gap-4">
                                <button onClick={() => setAddingQuizToModule(module.id)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">+ Add Quiz</button>
                                <button onClick={() => setAddingLessonToModule(module.id)} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">+ Add Lesson</button>
                            </div>
                        </div>

                        {/* Add Lesson Form */}
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

                        {/* Add Quiz Form */}
                        {addingQuizToModule === module.id && (
                            <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                                <h3 className="text-xs font-semibold uppercase text-slate-500 mb-3">New Quiz</h3>
                                <form action={(fd) => handleAddQuiz(module.id, fd)} className="flex gap-2">
                                    <input name="title" required placeholder="Quiz Title (e.g. Final Exam)" className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
                                    <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Create & Build</button>
                                    <button type="button" onClick={() => setAddingQuizToModule(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
                                </form>
                            </div>
                        )}

                        <div className="divide-y divide-slate-800">
                            {/* Render Lessons */}
                            {module.lessons?.map((lesson) => (
                                <div key={lesson.id} className="group flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors ml-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded flex items-center justify-center bg-orange-500/20 text-orange-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        </div>
                                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${lesson.content_type === 'video' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
                                            {lesson.content_type}
                                        </span>
                                        <span className="text-sm text-slate-300 font-medium">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/instructor/lessons/${lesson.id}`} className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </Link>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Render Quizzes */}
                            {module.quizzes?.map((quiz) => (
                                <div key={quiz.id} className="p-3 pl-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors bg-emerald-900/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                            Quiz
                                        </span>
                                        <span className="text-sm text-slate-300">{quiz.title}</span>
                                    </div>
                                    <Link href={`/instructor/courses/${courseId}/quizzes/${quiz.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                                        Edit
                                    </Link>
                                </div>
                            ))}

                            {(!module.lessons?.length && !module.quizzes?.length) && (
                                <div className="p-4 text-center text-xs text-slate-600 italic">No content in this module yet.</div>
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
