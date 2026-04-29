export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import CalendarioClient from './CalendarioClient'
import type { Match, Team } from '@/types'
import {
  simulateGroupStandings,
  buildProjectedQualifiers,
  buildFullBracketProjection,
  type MatchProjection,
} from '@/lib/utils/simulate'

export default async function CalendarioPage() {
  const supabase = await createClient()

  const [matchesRes, teamsRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:home_team_id(id, name, code, flag_emoji, group_code), away_team:away_team_id(id, name, code, flag_emoji, group_code)')
      .order('match_number', { ascending: true }),
    supabase
      .from('teams')
      .select('*')
      .order('group_code')
      .order('name'),
  ])

  const matches = (matchesRes.data ?? []) as unknown as Match[]
  const teams   = (teamsRes.data ?? [])   as Team[]

  // Calcular standings y bracket desde resultados REALES (sin predicciones de usuarios)
  const realStandings = simulateGroupStandings(matches, new Map(), teams)
  const realQualifiers = buildProjectedQualifiers(realStandings)
  const realBracket   = buildFullBracketProjection(realQualifiers, matches, new Map())

  const bracketObj: Record<number, MatchProjection> = {}
  for (const [k, v] of realBracket) bracketObj[k] = v

  const standingsObj: Record<string, ReturnType<typeof realStandings.get>> = {}
  for (const [g, rows] of realStandings) standingsObj[g] = rows

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Fixture y tablas</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">FIFA World Cup 2026 · 11 Jun – 19 Jul</p>
      <CalendarioClient
        matches={matches}
        teams={teams}
        realQualifiers={Object.fromEntries(realQualifiers)}
        realBracket={bracketObj}
        realStandings={standingsObj}
      />
    </div>
  )
}
