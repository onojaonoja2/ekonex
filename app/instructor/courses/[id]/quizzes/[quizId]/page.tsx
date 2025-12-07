import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import QuizEditor from './quiz-editor'

export default async function QuizBuilderPage({
    params
}: {
    params: { id: string, quizId: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { id: courseId, quizId } = await params

    // Fetch quiz
    const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

    if (!quiz) {
        return <div>Quiz not found</div>
    }

    // Fetch questions and answers
    const { data: questions } = await supabase
        .from('questions')
        .select(`
            *,
            answers (*)
        `)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true })

    // Sort answers by created_at as well locally since nested sort is tricky in one go
    const sortedQuestions = questions?.map(q => ({
        ...q,
        answers: q.answers?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    })) || []

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href={`/instructor/courses/${courseId}`} className="text-sm text-slate-400 hover:text-indigo-400 mb-2 inline-block">
                        &larr; Back to Course
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-display text-white">{quiz.title}</h1>
                        <span className="text-sm font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                            Passing Score: {quiz.passing_score}%
                        </span>
                    </div>
                    <p className="text-slate-500 mt-2">Add questions and mark the correct answers.</p>
                </div>

                <div className="rounded-2xl glass p-8 border border-slate-800">
                    <QuizEditor
                        courseId={courseId}
                        quiz={quiz}
                        questions={sortedQuestions}
                    />
                </div>
            </div>
        </div>
    )
}
