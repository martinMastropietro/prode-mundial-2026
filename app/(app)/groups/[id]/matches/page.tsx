import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import MatchList from '@/components/matches/MatchList'
import ExtrasSection from './ExtrasSection'
import type { Match, Prediction, Team, SpecialPrediction } from '@/types'
import {
  simulateGroupStandings,
  buildProjectedQualifiers,
  buildFullBracketProjection,
} from '@/lib/utils/simulate'

type Props = { params: Promise<{ id: string }> }

const LOCK_DATE = new Date('2026-06-11T00:00:00Z')

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

  const [matchesRes, teamsRes, predictionsRes, groupRes, specialRes] = await Promise.all([
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
    supabase
      .from('groups')
      .select('has_top_scorer, has_top_assist, has_mvp')
      .eq('id', groupId)
      .single(),
    supabase
      .from('special_predictions')
      .select('top_scorer_name, top_assist_name, mvp_name')
      .eq('user_id', user!.id)
      .eq('group_id', groupId)
      .maybeSingle(),
  ])

  const matches = (matchesRes.data ?? []) as unknown as Match[]
  const teams = (teamsRes.data ?? []) as Team[]
  const predictions = predictionsRes.data ?? []
  const group = groupRes.data
  const special = specialRes.data

  const predictionMap = new Map<string, Prediction>()
  predictions.forEach(p => predictionMap.set(p.match_id, p as unknown as Prediction))

  const standings = simulateGroupStandings(matches, predictionMap, teams)
  const qualifiers = buildProjectedQualifiers(standings)
  const bracketProjection = buildFullBracketProjection(qualifiers, matches, predictionMap)

  const bracketProjectionObj: Record<number, { home: Team | null; away: Team | null }> = {}
  for (const [k, v] of bracketProjection) bracketProjectionObj[k] = v

  const hasExtras = group?.has_top_scorer || group?.has_top_assist || group?.has_mvp
  const locked = new Date() >= LOCK_DATE

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Tus predicciones</h1>

      {/* Extras: goleador, asistidor, MVP */}
      {hasExtras && (
        <ExtrasSection
          groupId={groupId}
          group={group!}
          existing={special as Pick<SpecialPrediction, 'top_scorer_name' | 'top_assist_name' | 'mvp_name'> | null}
          locked={locked}
        />
      )}

      {/* Bracket */}
      <section className="mb-8">
        <div className="mb-3 px-3 py-2 bg-[#003087]/20 border border-[#003087]/30 rounded-xl text-xs text-[#6699ff]">
          ⚡ Cuadro proyectado desde tus predicciones — se actualiza automáticamente
        </div>
        <KnockoutBracket
          matches={matches.filter(m => m.phase !== 'group')}
          projectedQualifiers={qualifiers}
          projectedMatches={bracketProjectionObj}
        />
      </section>

      {/* Predicciones partido a partido */}
      <MatchList
        matches={matches}
        predictionMap={predictionMap}
        groupId={groupId}
        bracketProjection={bracketProjectionObj}
      />
    </div>
  )
}
