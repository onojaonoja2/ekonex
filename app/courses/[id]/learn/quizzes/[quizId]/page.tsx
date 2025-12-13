import { createClient } from '@/utils/supabase/server'
import QuizPlayer from './quiz-player'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function QuizPage({ params }: { params: { id: string, quizId: string } }) {
    const supabase = await createClient()
    const { id: courseId, quizId } = await params

    const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

    if (!quiz) return <div>Quiz not found</div>

    // Fetch questions and answers to render (answers DO NOT have is_correct in client for security, ideally we filter that out or use separate query)
    // For MVP, if RLS allows selecting is_correct, we should strip it here before passing to client component

    const { data: questions } = await supabase
        .from('questions')
        .select(`
            id, text, points, position,
            answers (id, text)
        `) // Explicitly NOT selecting is_correct
        .eq('quiz_id', quizId)
        .order('position', { ascending: true })

    return (
        <QuizPlayer
            quiz={quiz}
            questions={questions || []}
            courseId={courseId}
        />
    )
}
