'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = formData.get('fullName') as string
    const website = formData.get('website') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
    })

    if (error) {
        return { error: 'Could not update profile' }
    }

    revalidatePath('/profile')
    return { message: 'Profile updated!' }
}
