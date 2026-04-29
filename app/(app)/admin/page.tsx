import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminMatchList from './AdminMatchList'
import RecalculateButton from './RecalculateButton'
import type { Match } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(id, name, flag_emoji, code), away_team:away_team_id(id, name, flag_emoji, code)')
    .order('match_number', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black">Panel de resultados</h1>
          <span className="px-2 py-0.5 bg-[#C8102E]/20 text-[#C8102E] text-xs font-bold rounded-full">ADMIN</span>
        </div>
        <RecalculateButton />
      </div>
      <p className="text-[#8B8FA8] text-sm mb-6">
        Al marcar un partido como &quot;Terminado&quot;, los puntos se calculan automáticamente.
        Usá &quot;Recalcular todos&quot; si editaste algún resultado.
      </p>
      <AdminMatchList matches={(matches ?? []) as unknown as Match[]} />
    </div>
  )
}
