import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { CourseCard } from "@/components/course-card";
import { HeroBackground } from "@/components/hero-background";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch published courses (limit 3 for home page)
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  console.log('Home Page Courses Fetch:', { courses, error })

  if (error) {
    console.error('Error fetching courses:', error)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 relative overflow-hidden bg-slate-950">
      <HeroBackground />

      {/* Hero Section */}
      <section className="relative z-10 flex w-full flex-col items-center text-center gap-8 max-w-4xl py-24">
        <h1 className="hero-reveal font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]" style={{ animationDelay: "0.05s" }}>
          <span className="block text-white">Learn beyond</span>
          <span
            className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent"
            style={{ animation: "hero-float 6s ease-in-out 1s infinite" }}
          >
            the classroom.
          </span>
        </h1>

        <p className="hero-reveal text-lg md:text-xl text-slate-400 leading-relaxed font-light max-w-2xl" style={{ animationDelay: "0.2s" }}>
          Ekonex pairs expert-led courses with AI-driven insights, so every learner moves faster and every instructor teaches smarter.
        </p>

        <div className="hero-reveal flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-sm justify-center" style={{ animationDelay: "0.35s" }}>
          <Link
            href="#courses"
            className="group relative flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
          >
            <span>Explore Courses</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>

          <Link
            href="/get-started"
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 px-8 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Course Showcase */}
      <div id="courses" className="w-full max-w-7xl mx-auto py-12 border-t border-slate-800/50">
        <div className="flex items-center justify-between mb-12 px-4">
          <h2 className="text-3xl font-bold text-white font-display">Featured Courses</h2>
          <Link href="/courses" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            View All <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </Link>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {courses.map((course) => (
              <div key={course.id} className="h-[400px]">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed mx-4">
            <h3 className="text-lg font-medium text-slate-300">New content coming soon</h3>
            <p className="text-slate-500 mt-2">Our instructors are crafting amazing courses.</p>
          </div>
        )}
      </div>

      <footer className="mt-auto py-12 text-center border-t border-slate-800/50 w-full">
        <p className="text-xs text-slate-600 mb-2">© 2026 Ekonex. All rights reserved.</p>
        <p className="text-[10px] text-slate-700 font-mono tracking-widest uppercase opacity-50">Next level in digital education</p>
      </footer>
    </main>
  );
}
