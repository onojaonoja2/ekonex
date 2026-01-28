'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    courseId?: string
}

export default function AuthModal({ isOpen, onClose, courseId }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'login') {
                const { data: { user }, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast.success('Logged in successfully')

                // Determine redirect based on role
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                    if (profile?.role === 'instructor') {
                        router.push('/instructor/dashboard')
                    } else if (courseId) {
                        router.push(`/courses/${courseId}`)
                    } else {
                        router.push('/student/dashboard')
                    }
                } else {
                    router.refresh()
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback?next=/courses/${courseId || ''}`,
                    }
                })
                if (error) throw error

                if (data.session) {
                    toast.success('Account created and logged in!')
                    if (courseId) {
                        router.push(`/courses/${courseId}`)
                    } else {
                        router.refresh() // Or dashboard
                    }
                } else if (data.user && !data.session) {
                    toast.success('Registration successful! Please check your email to confirm.')
                    console.log('Signup successful, identifying email confirmation needed.', data)
                }
            }

            onClose()
            router.refresh()

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2 font-display">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 mb-6">
                        {mode === 'login' ? 'Enter your details to continue learning.' : 'Start your learning journey today.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
