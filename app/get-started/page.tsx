import Link from 'next/link'
import { GraduationCap, Users, ArrowRight } from 'lucide-react'

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
                    Join the
                    <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent ml-2">
                        Ekonex
                    </span> Community
                </h1>
                <p className="text-slate-400 text-lg">Choose your path to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* Student Option */}
                <Link
                    href="/register?role=student"
                    className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 text-left"
                >
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <GraduationCap size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">I want to Learn</h3>
                    <p className="text-slate-400 mb-6">Access premium courses, track your progress, and earn certifications.</p>
                    <div className="flex items-center text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                        Create Student Account <ArrowRight size={16} className="ml-2" />
                    </div>
                </Link>

                {/* Instructor Option */}
                <Link
                    href="/register?role=instructor"
                    className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 text-left"
                >
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Users size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">I want to Teach</h3>
                    <p className="text-slate-400 mb-6">Create courses, manage students, and share your knowledge with the world.</p>
                    <div className="flex items-center text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                        Become an Instructor <ArrowRight size={16} className="ml-2" />
                    </div>
                </Link>
            </div>

            <div className="mt-12 text-slate-500">
                Already have an account?
                <Link href="/login" className="text-white hover:text-indigo-400 font-medium ml-2 transition-colors">Log in</Link>
            </div>
        </div>
    )
}
