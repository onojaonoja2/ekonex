'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to check if current user is admin
async function checkAdminRole() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['system_admin', 'sub_admin'].includes(profile.role)) {
        throw new Error('Unauthorized: Admin access required')
    }
    return { user, role: profile.role }
}

// Helper to check if current user is system_admin
async function checkSystemAdminRole() {
    const { role } = await checkAdminRole()
    if (role !== 'system_admin') {
        throw new Error('Unauthorized: System Admin access required')
    }
}

export async function createUser(prevState: any, formData: FormData) {
    try {
        await checkAdminRole()

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as string // 'student', 'instructor', 'sub_admin'

        if (!email || !password || !fullName || !role) {
            return { error: 'Missing required fields' }
        }

        const supabaseAdmin = createAdminClient()

        // Create user in Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (authError) throw authError

        // Update profile role (since trigger defaults to student)
        if (authUser.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ role: role })
                .eq('id', authUser.user.id)

            if (profileError) throw profileError
        }

        revalidatePath('/admin/users')
        return { success: true, message: `User created successfully as ${role}` }
    } catch (error: any) {
        console.error('Create User Error:', error)
        return { error: error.message || 'Failed to create user' }
    }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
    try {
        const { role: adminRole } = await checkAdminRole()
        const supabaseAdmin = createAdminClient()

        // Check target user role
        const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single()

        // Authorization checks
        if (targetProfile?.role === 'system_admin') {
            throw new Error('Cannot modify System Admin')
        }
        if (adminRole === 'sub_admin' && targetProfile?.role === 'sub_admin') {
            throw new Error('Sub Admins cannot modify other Admins')
        }

        const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

        // Update profile status
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', userId)

        if (error) throw error

        // Also ban/unban in Auth
        if (newStatus === 'suspended') {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876600h' }) // 100 years
        } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteUser(userId: string) {
    try {
        const { role: adminRole } = await checkAdminRole()
        const supabaseAdmin = createAdminClient()

        // Check target user role
        const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single()

        if (targetProfile?.role === 'system_admin') {
            throw new Error('Cannot delete System Admin')
        }
        if (adminRole === 'sub_admin' && (targetProfile?.role === 'sub_admin' || targetProfile?.role === 'system_admin')) {
            throw new Error('Sub Admins cannot delete other Admins')
        }

        // Delete from Auth (cascades to DB usually, unless configured otherwise)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (error) throw error

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function enrollUserInCourse(email: string, courseId: string) {
    try {
        await checkAdminRole()
        const supabaseAdmin = createAdminClient()

        // Find user by email
        // Since we can't easily search auth users by email without listUsers which is paginated, 
        // we search profiles first (assuming email is synced there now!)
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (!profile) return { error: 'User not found' }

        // Enroll
        const { error } = await supabaseAdmin
            .from('enrollments')
            .insert({ user_id: profile.id, course_id: courseId })

        if (error) {
            if (error.code === '23505') return { error: 'User already enrolled' }
            throw error
        }

        return { success: true, message: 'Enrolled successfully' }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function toggleCourseStatus(courseId: string, isPaused: boolean) {
    try {
        await checkAdminRole()
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin
            .from('courses')
            .update({ is_paused: !isPaused })
            .eq('id', courseId)

        if (error) throw error

        revalidatePath('/admin/courses')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteCourse(courseId: string) {
    try {
        await checkAdminRole()
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', courseId)

        if (error) throw error

        revalidatePath('/admin/courses')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
