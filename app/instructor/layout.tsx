import Link from 'next/link'
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown'
import { createClient } from '@/utils/supabase/server'

export default async function InstructorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-indigo-500/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
                <div className="container mx-auto px-4 flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link href="/instructor/courses" className="mr-6 flex items-center space-x-2">
                            <span className="font-bold text-indigo-400">
                                Ekonex Instructor
                            </span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link
                                href="/instructor/courses"
                                className="transition-colors hover:text-white/80 text-white/60"
                            >
                                Courses
                            </Link>
                        </nav>
                    </div>

                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center gap-4">
                            {user && <NotificationsDropdown />}
                            {/* ProfileDropdown is now in Global Header */}
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    )
}
