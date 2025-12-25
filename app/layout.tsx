import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ProfileDropdown from '@/components/profile-dropdown';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Ekonex - LMS Platform",
  description: "Next-gen Learning Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="Ekonex Logo" className="h-8 w-8" />
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-display">Ekonex</span>
                    <span className="hidden md:block text-[10px] text-slate-500 uppercase tracking-widest font-medium">Next level in digital education</span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    {/* <NotificationsDropdown /> - Can render here if generic, or keep specific */}
                    <ProfileDropdown
                      email={user.email!}
                      fullName={profile?.full_name}
                      role={profile?.role || 'student'}
                    />
                  </>
                ) : (
                  <Link href="/login" className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                    Log In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
