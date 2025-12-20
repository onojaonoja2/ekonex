'use client'

import { useState } from 'react'
import { submitQuiz } from '@/app/courses/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function QuizPlayer({
    quiz,
    questions,
    courseId
}: {
    quiz: any,
    questions: any[],
    courseId: string
}) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ score: number, isPassed: boolean } | null>(null)

    function handleSelect(questionId: string, answerId: string) {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }))
    }

    async function handleSubmit() {
        if (Object.keys(answers).length < questions.length) {
            toast.error('Please answer all questions')
            return
        }

        setIsSubmitting(true)
        const res = await submitQuiz(quiz.id, courseId, answers)
        setIsSubmitting(false)

        if (res?.error) {
            toast.error(res.error)
        } else if (res?.success) {
            setResult({ score: res.score, isPassed: res.isPassed })
            toast.success('Quiz submitted!')
            router.refresh()
        }
    }

    if (result) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center">
                <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full mb-6 ${result.isPassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <span className="text-4xl font-bold">{result.score}%</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{result.isPassed ? 'Congratulations!' : 'Keep Trying'}</h2>
                <p className="text-slate-400 mb-8">{result.isPassed ? 'You passed the quiz.' : 'You did not reach the passing score.'}</p>

                <button
                    onClick={() => { setResult(null); setAnswers({}); }}
                    className="rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                    Retake Quiz
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
                <p className="text-slate-400">Answer all questions to complete this quiz.</p>
            </div>

            <div className="space-y-8">
                {questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="text-lg font-medium text-slate-200 mb-4">
                            <span className="text-slate-500 mr-2">{idx + 1}.</span>
                            {q.text}
                        </h3>
                        <div className="space-y-2 ml-6">
                            {q.answers.map((a: any) => (
                                <button
                                    key={a.id}
                                    onClick={() => handleSelect(q.id, a.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${answers[q.id] === a.id
                                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                                        }`}
                                >
                                    {a.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        </div>
    )
}
