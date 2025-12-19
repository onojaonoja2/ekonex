'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error)
        redirect('/login?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Extract extra metadata
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = (formData.get('role') as string) || 'student'
    const organizationId = formData.get('organizationId') as string
    const redirectUrl = formData.get('redirectUrl') as string

    const data = {
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
                organization_id: organizationId || null,
            },
            emailRedirectTo: redirectUrl ? `${process.env.NEXT_PUBLIC_SITE_URL}${redirectUrl}` : undefined
        }
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup Error:', error)
        redirect('/register?error=' + encodeURIComponent(error.message))
    }

    if (!authData.session) {
        // Email confirmation is required
        redirect('/login?message=Please check your email to confirm your account.')
    }

    if (redirectUrl) {
        revalidatePath(redirectUrl)
        redirect(redirectUrl)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
