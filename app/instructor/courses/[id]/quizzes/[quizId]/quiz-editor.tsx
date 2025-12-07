'use client'

import { useState } from 'react'
import { createQuestion, createAnswer, deleteQuestion } from '@/app/instructor/actions'
import { toast } from 'sonner'
import Link from 'next/link'

type Answer = {
    id: string
    text: string
    is_correct: boolean
}

type Question = {
    id: string
    text: string
    points: number
    answers: Answer[]
}

type Quiz = {
    id: string
    title: string
    module_id: string
    passing_score: number
}

export default function QuizEditor({
    courseId,
    quiz,
    questions
}: {
    courseId: string,
    quiz: Quiz,
    questions: Question[]
}) {
    const [isAddingQuestion, setIsAddingQuestion] = useState(false)
    const [addingAnswerToQuestion, setAddingAnswerToQuestion] = useState<string | null>(null)

    async function handleAddQuestion(formData: FormData) {
        const result = await createQuestion(quiz.id, formData)
        if (result?.error) toast.error(result.error)
        else {
            toast.success('Question added')
            setIsAddingQuestion(false)
        }
    }

    async function handleAddAnswer(questionId: string, formData: FormData) {
        const result = await createAnswer(questionId, quiz.id, formData)
        if (result?.error) toast.error(result.error)
        else {
            toast.success('Answer added')
            setAddingAnswerToQuestion(null)
        }
    }

    async function handleDeleteQuestion(questionId: string) {
        if (!confirm('Are you sure? This will delete the question and all answers.')) return
        await deleteQuestion(questionId, quiz.id)
        toast.success('Question deleted')
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="font-medium text-slate-200 text-lg">{question.text}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{question.points} points</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20"
                            >
                                Delete
                            </button>
                        </div>

                        <div className="ml-9 space-y-3">
                            {question.answers.map((answer) => (
                                <div key={answer.id} className={`flex items-center gap-3 p-3 rounded-lg border ${answer.is_correct ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-950 border-slate-800'}`}>
                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${answer.is_correct ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                                        {answer.is_correct && <span className="text-[10px] font-bold text-white">✓</span>}
                                    </div>
                                    <span className={answer.is_correct ? 'text-emerald-200' : 'text-slate-400'}>{answer.text}</span>
                                    {answer.is_correct && <span className="ml-auto text-xs text-emerald-500 font-medium">Correct Answer</span>}
                                </div>
                            ))}

                            {addingAnswerToQuestion === question.id ? (
                                <form action={(fd) => handleAddAnswer(question.id, fd)} className="p-4 bg-slate-950 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Add Answer Option</h4>
                                    <div className="space-y-3">
                                        <input name="text" required placeholder="Answer text..." className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" name="isCorrect" id={`correct-${question.id}`} className="rounded border-slate-600 bg-slate-800" />
                                            <label htmlFor={`correct-${question.id}`} className="text-sm text-slate-300">This is the correct answer</label>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <button type="button" onClick={() => setAddingAnswerToQuestion(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                                            <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Add Answer</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setAddingAnswerToQuestion(question.id)}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                                >
                                    + Add Answer Option
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isAddingQuestion ? (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">New Question</h3>
                    <form action={handleAddQuestion} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-indigo-300 uppercase mb-1">Question Text</label>
                            <textarea name="text" required placeholder="What is the capital of France?" rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">Cancel</button>
                            <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">Create Question</button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingQuestion(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 font-semibold hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                >
                    + Add Question
                </button>
            )}
        </div>
    )
}
