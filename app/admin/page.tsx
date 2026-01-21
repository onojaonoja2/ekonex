import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // parallel fetch
    const [
        { count: userCount },
        { count: courseCount },
        { count: activeCourseCount },
        { count: instructorCount },
        { count: studentCount }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('is_paused', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
    ])

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Users</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-white">{userCount || 0}</p>
                        <span className="text-sm text-slate-500">
                            ({instructorCount || 0} Instr, {studentCount || 0} Stu)
                        </span>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Courses</h3>
                    <p className="text-4xl font-bold text-white">{courseCount || 0}</p>
                </div>
                <div className="glass p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Active Courses</h3>
                    <p className="text-4xl font-bold text-emerald-400">{activeCourseCount || 0}</p>
                </div>
                {/* Placeholder for Revenue or other metrics */}
                <div className="glass p-6 rounded-2xl border border-slate-800 opacity-50">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Platform Revenue</h3>
                    <p className="text-4xl font-bold text-white">$0</p>
                </div>
            </div>

            <div className="mt-8 p-8 glass rounded-2xl text-center text-slate-500 border border-slate-800">
                <p>Welcome to the System Administration Console. Use the sidebar access specific management tools.</p>
            </div>
        </div>
    )
}
