import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const isAdmin = user.email === process.env.ADMIN_EMAIL

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar profile={profile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
