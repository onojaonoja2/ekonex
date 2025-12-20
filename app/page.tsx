import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { CourseCard } from "@/components/course-card";

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
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center text-center gap-8 max-w-4xl py-24">
        <h1 className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-6xl md:text-8xl font-bold text-transparent font-display tracking-tight">
          Ekonex
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
          Empowering the next generation of learners with AI-driven insights and seamless content delivery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-sm justify-center">
          <Link
            href="#courses"
            className="group relative flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50"
          >
            <span>Explore Courses</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>

          <Link
            href="/get-started"
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 px-8 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Course Showcase */}
      <div id="courses" className="w-full max-w-7xl mx-auto py-12 border-t border-slate-800/50">
        <div className="flex items-center justify-between mb-12 px-4">
          <h2 className="text-3xl font-bold text-white font-display">Featured Courses</h2>
          <Link href="/courses" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
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
        <p className="text-xs text-slate-600 mb-2">© 2024 Ekonex. All rights reserved.</p>
        <p className="text-[10px] text-slate-700 font-mono tracking-widest uppercase opacity-50">Next level in digital education</p>
      </footer>
    </main>
  );
}
