
import { login, signup } from '../auth/actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    // Next.js 15+ searchParams is a Promise
    const { message } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10">
                <div className="mb-8 text-center">
                    <h1 className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-4xl font-bold text-transparent font-display">
                        Ekonex
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Welcome back to your learning journey
                    </p>
                </div>

                <form className="flex flex-col gap-4">
                    <div className="group relative">
                        <input
                            className="peer w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-200 placeholder-transparent outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-4 top-3 z-10 -translate-y-7 scale-75 pt-1 text-xs text-slate-400 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-indigo-400"
                        >
                            Email Address
                        </label>
                    </div>

                    <div className="group relative">
                        <input
                            className="peer w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-200 placeholder-transparent outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-3 z-10 -translate-y-7 scale-75 pt-1 text-xs text-slate-400 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-indigo-400"
                        >
                            Password
                        </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 active:scale-95"
                        >
                            Log In
                        </button>
                        <button
                            formAction={signup}
                            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
                        >
                            Sign Up
                        </button>
                    </div>

                    {message && (
                        <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400 border border-red-500/20">
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
