import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Building2, Settings, LogOut, Shield } from 'lucide-react'
import { signout } from '../auth/actions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'system_admin' && profile.role !== 'org_admin' && profile.role !== 'sub_admin')) {
        redirect('/') // Unauthorized
    }

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Courses', href: '/admin/courses', icon: Building2 }, // Reusing icon for now
    ]

    if (profile.role === 'system_admin') {
        navItems.push({ label: 'Admins', href: '/admin/admins', icon: Shield })
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col fixed inset-y-0">
                <div className="mb-8 flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">E</div>
                    <span className="font-bold text-xl text-white">Admin</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <form action={signout}>
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
