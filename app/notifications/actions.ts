'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fetchNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    return data || []
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    revalidatePath('/')
}

export async function createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const supabase = await createClient()

    await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type
    })

    // We don't revalidate path here strictly because it might be called from background, 
    // but usually the user will refresh or we can revalidate common paths.
}
