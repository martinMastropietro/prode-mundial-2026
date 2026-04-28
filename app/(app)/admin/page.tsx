import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminMatchList from './AdminMatchList'
import type { Match } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Solo el admin puede acceder
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(id, name, flag_emoji, code), away_team:away_team_id(id, name, flag_emoji, code)')
    .order('match_number', { ascending: true })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-black">Panel de resultados</h1>
        <span className="px-2 py-0.5 bg-[#C8102E]/20 text-[#C8102E] text-xs font-bold rounded-full">ADMIN</span>
      </div>
      <p className="text-[#8B8FA8] text-sm mb-6">
        Cargá el resultado de cada partido. Al marcar como "Terminado", los puntos se calculan automáticamente para todos los grupos.
      </p>
      <AdminMatchList matches={(matches ?? []) as unknown as Match[]} />
    </div>
  )
}
