
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Merge profile data with user email 
    const profileData = {
        ...profile,
        email: user.email,
    }

    return (
        <div className="min-h-screen bg-transparent p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl glass rounded-2xl p-8 md:p-12 mb-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                        Account Settings
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage your personal information and preferences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="col-span-1">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-500/20 mx-auto md:mx-0">
                            {profileData.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="mt-6 text-center md:text-left">
                            <h3 className="font-semibold text-lg text-white">{profileData.full_name || 'User'}</h3>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <ProfileForm profile={profileData} />
                    </div>
                </div>
            </div>
        </div>
    )
}
