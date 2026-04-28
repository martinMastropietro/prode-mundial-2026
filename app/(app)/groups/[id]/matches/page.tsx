import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchList from '@/components/matches/MatchList'
import type { Match, Prediction, Team } from '@/types'
import {
  simulateGroupStandings,
  buildProjectedQualifiers,
  buildFullBracketProjection,
} from '@/lib/utils/simulate'

type Props = { params: Promise<{ id: string }> }

export default async function GroupMatchesPage({ params }: Props) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!membership) redirect('/dashboard')

  const [matchesRes, teamsRes, predictionsRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:home_team_id(id, name, code, flag_emoji, group_code), away_team:away_team_id(id, name, code, flag_emoji, group_code)')
      .order('match_number', { ascending: true }),
    supabase.from('teams').select('*'),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user!.id)
      .eq('group_id', groupId),
  ])

  const matches = (matchesRes.data ?? []) as unknown as Match[]
  const teams = (teamsRes.data ?? []) as Team[]
  const predictions = predictionsRes.data ?? []

  const predictionMap = new Map<string, Prediction>()
  predictions.forEach(p => predictionMap.set(p.match_id, p as unknown as Prediction))

  // Calcular proyección completa: grupo → R32 → R16 → QF → SF → Final
  const standings = simulateGroupStandings(matches, predictionMap, teams)
  const qualifiers = buildProjectedQualifiers(standings)
  const bracketProjection = buildFullBracketProjection(qualifiers, matches, predictionMap)

  // Serializar para pasar al cliente
  const bracketProjectionObj: Record<number, { home: Team | null; away: Team | null }> = {}
  for (const [k, v] of bracketProjection) bracketProjectionObj[k] = v

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Partidos</h1>
      <MatchList
        matches={matches}
        predictionMap={predictionMap}
        groupId={groupId}
        bracketProjection={bracketProjectionObj}
      />
    </div>
  )
}
