import { createClient } from '@/lib/supabase/server'
import CalendarioClient from './CalendarioClient'
import type { Match } from '@/types'

export default async function CalendarioPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:home_team_id(id, name, code, flag_emoji),
      away_team:away_team_id(id, name, code, flag_emoji)
    `)
    .order('match_number', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Calendario</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">FIFA World Cup 2026 · 11 Jun – 19 Jul</p>
      <CalendarioClient matches={(matches ?? []) as unknown as Match[]} />
    </div>
  )
}
