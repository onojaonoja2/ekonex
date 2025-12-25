'use client'

import { updateProfile } from './actions'
import { useState } from 'react'
import { toast } from 'sonner'
import AvatarUpload from '@/components/avatar-upload'

export default function ProfileForm({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Ensure avatar_url is included
        if (avatarUrl) {
            formData.set('avatarUrl', avatarUrl)
        }

        const result = await updateProfile(formData)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Profile updated!')
        }
    }

    return (
        <div className="flex flex-col w-full max-w-lg gap-8">
            <div className="mx-auto">
                <AvatarUpload
                    uid={profile.id}
                    url={avatarUrl}
                    onUpload={(url) => setAvatarUrl(url)}
                />
            </div>

            <form action={handleSubmit} className="flex flex-col gap-6 w-full">
                <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-400">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        value={profile?.email || ''}
                        disabled
                        className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-slate-400">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        defaultValue={profile?.full_name || ''}
                        className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        placeholder="John Doe"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="website" className="text-sm font-medium text-slate-400">
                        Website
                    </label>
                    <input
                        id="website"
                        name="website"
                        type="url"
                        defaultValue={profile?.website || ''}
                        className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        placeholder="https://example.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </div>
    )
}
