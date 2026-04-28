export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import CalendarioClient from './CalendarioClient'
import type { Match, Prediction, Team } from '@/types'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [matchesRes, teamsRes, predictionsRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:home_team_id(id, name, code, flag_emoji, group_code), away_team:away_team_id(id, name, code, flag_emoji, group_code)')
      .order('match_number', { ascending: true }),
    supabase
      .from('teams')
      .select('*')
      .order('group_code')
      .order('name'),
    user
      ? supabase
          .from('predictions')
          .select('match_id, predicted_home_score, predicted_away_score, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  // Dedup predictions: una por match (la más reciente)
  const predMap = new Map<string, Prediction>()
  for (const p of predictionsRes.data ?? []) {
    if (!predMap.has(p.match_id)) predMap.set(p.match_id, p as unknown as Prediction)
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Calendario</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">FIFA World Cup 2026 · 11 Jun – 19 Jul</p>
      <CalendarioClient
        matches={(matchesRes.data ?? []) as unknown as Match[]}
        teams={(teamsRes.data ?? []) as Team[]}
        userPredictions={Object.fromEntries(predMap)}
      />
    </div>
  )
}
