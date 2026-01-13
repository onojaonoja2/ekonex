import Link from 'next/link'
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown'
import { createClient } from '@/utils/supabase/server'

export default async function CoursesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
                <div className="container mx-auto px-4 flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link href="/courses" className="mr-6 flex items-center space-x-2">
                            <span className="hidden font-bold sm:inline-block text-white">
                                Ekonex
                            </span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link
                                href="/courses"
                                className="transition-colors hover:text-white/80 text-white/60"
                            >
                                Browse
                            </Link>
                            <Link
                                href="/learning" // Assuming this is where 'My Learning' is
                                className="transition-colors hover:text-white/80 text-white/60"
                            >
                                My Learning
                            </Link>
                        </nav>
                    </div>

                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search could go here */}
                        </div>
                        <nav className="flex items-center gap-2">
                            {user && <NotificationsDropdown />}
                            {/* User Profile Menu could go here */}
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    )
}
