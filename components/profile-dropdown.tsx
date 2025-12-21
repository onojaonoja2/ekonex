'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProfileDropdownProps {
    email: string
    fullName?: string | null
    role?: string
}

export default function ProfileDropdown({ email, fullName, role }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    // Close dropdown when clicking outside (simple implementation)
    // In a production app, use a proper click-outside hook or UI library
    const toggle = () => setIsOpen(!isOpen)

    return (
        <div className="relative">
            <button
                onClick={toggle}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                    {fullName?.[0]?.toUpperCase() || email[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-white line-clamp-1 max-w-[100px]">{fullName || email}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{role || 'User'}</p>
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-3 border-b border-slate-800">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account</p>
                            <p className="text-sm text-white truncate">{email}</p>
                        </div>
                        <div className="p-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                Profile
                            </Link>
                            {role === 'student' && (
                                <Link
                                    href="/profile" // Assuming profile is the dashboard for students
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                    My Learning
                                </Link>
                            )}
                            {role === 'instructor' && (
                                <Link
                                    href="/instructor/courses"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                    Instructor Dashboard
                                </Link>
                            )}
                        </div>
                        <div className="p-1 border-t border-slate-800">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                Log out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
