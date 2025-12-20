import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string, error?: string, courseId?: string }>
}) {
    const { role = 'student', error, courseId } = await searchParams
    const isInstructor = role === 'instructor'

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <Link
                href="/get-started"
                className="absolute top-8 left-8 text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </Link>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create {isInstructor ? 'Instructor' : 'Student'} Account
                    </h1>
                    <p className="text-slate-400">
                        {courseId
                            ? 'Create an account to enroll in the course.'
                            : 'Fill in your details to get started.'}
                    </p>
                </div>

                <form className="glass rounded-3xl p-8 border border-white/5 shadow-2xl">
                    <input type="hidden" name="role" value={role} />
                    {courseId && <input type="hidden" name="redirectUrl" value={`/courses/${courseId}`} />}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        formAction={signup}
                        className={`w-full mt-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] ${isInstructor
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/20 hover:shadow-indigo-500/40'
                            }`}
                    >
                        Create Account
                    </button>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white hover:underline">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
