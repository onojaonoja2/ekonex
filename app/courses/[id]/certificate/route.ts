import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id: courseId } = params;
    const supabase = await createClient()
    // If params need to be awaited in newer Next.js:
    // const { id } = await params;

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect(`/login?next=/courses/${courseId}/certificate`)
    }

    // 1. Fetch Course Lessons
    const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id, modules!inner(course_id)')
        .eq('modules.course_id', courseId)

    if (!courseLessons || courseLessons.length === 0) {
        // Invalid course or no lessons
        return redirect(`/courses/${courseId}`)
    }

    // 2. Fetch User Progress
    const { data: completedLessons } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true)

    const completedSet = new Set(completedLessons?.map(c => c.lesson_id))
    const allCompleted = courseLessons.every(l => completedSet.has(l.id))

    if (!allCompleted) {
        // Not completed, redirect to learn page
        return redirect(`/courses/${courseId}/learn`)
    }

    // 3. Check for existing certificate
    const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    let certId = existingCert?.id

    if (!certId) {
        // 4. Issue Certificate
        const certificateCode = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

        const { data: newCert, error } = await supabase.from('certificates').insert({
            user_id: user.id,
            course_id: courseId,
            certificate_code: certificateCode
        }).select('id').single()

        if (error || !newCert) {
            console.error('Certificate Issuance Error:', error)
            return redirect(`/courses/${courseId}/learn?error=issuance_failed`)
        }
        certId = newCert.id
    }

    // 5. Redirect to Certificate
    return redirect(`/certificates/${certId}`)
}
