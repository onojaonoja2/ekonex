'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createCourse(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0

    // For MVP, instructor_id is just the user's ID.
    // We assume RLS policies prevent non-instructors from doing harm, 
    // though ideally we'd check a role here too.

    const { data, error } = await supabase.from('courses').insert({
        instructor_id: user.id,
        title,
        description,
        price,
        is_published: false,
    }).select().single()

    if (error) {
        console.error('Create Course Error:', error)
        return { error: 'Could not create course' }
    }

    revalidatePath('/instructor/courses')
    redirect(`/instructor/courses/${data.id}`)
}
