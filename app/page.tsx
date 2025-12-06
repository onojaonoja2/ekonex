import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="z-10 flex flex-col items-center text-center gap-8 max-w-2xl">
        <h1 className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-6xl md:text-8xl font-bold text-transparent font-display tracking-tight">
          Ekonex
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed font-light">
          Empowering the next generation of learners with AI-driven insights and seamless content delivery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm justify-center">
          <Link
            href="/login"
            className="group relative flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50"
          >
            <span>Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>

          <Link
            href="/about"
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 px-8 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
          >
            Learn More
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-slate-600">
        © 2024 Ekonex. All rights reserved.
      </footer>
    </main>
  );
}
