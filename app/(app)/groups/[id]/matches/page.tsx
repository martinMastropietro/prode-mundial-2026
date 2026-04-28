import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExtrasSection from './ExtrasSection'
import ImportPredictionsButton from './ImportPredictionsButton'
import PredictionsPanel from './PredictionsPanel'
import type { Match, Prediction, Team, SpecialPrediction } from '@/types'

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

  const [matchesRes, teamsRes, predictionsRes, groupRes, specialRes, otherGroupsRes] = await Promise.all([
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
    // Otros grupos del usuario con sus predicciones
    supabase
      .from('group_members')
      .select('group_id, group:groups(id, name, public_id)')
      .eq('user_id', user!.id)
      .neq('group_id', groupId),
  ])

  const matches = (matchesRes.data ?? []) as unknown as Match[]
  const teams = (teamsRes.data ?? []) as Team[]
  const predictions = predictionsRes.data ?? []
  const group = groupRes.data
  const special = specialRes.data

  // Otros grupos con al menos una predicción (contar en paralelo)
  const otherMemberships = otherGroupsRes.data ?? []
  const otherGroupCounts = await Promise.all(
    otherMemberships.map(async m => {
      const { count } = await supabase
        .from('predictions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('group_id', m.group_id)
      return {
        id: m.group_id,
        name: (m.group as any)?.name ?? m.group_id,
        public_id: (m.group as any)?.public_id ?? '',
        count: count ?? 0,
      }
    })
  )
  const sourceGroups = otherGroupCounts.filter(g => g.count > 0)

  const predictionMap = new Map<string, Prediction>()
  predictions.forEach(p => predictionMap.set(p.match_id, p as unknown as Prediction))

  const hasExtras = group?.has_top_scorer || group?.has_top_assist || group?.has_mvp
  const locked = new Date() >= LOCK_DATE

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Tus predicciones</h1>

      {/* Importar predicciones de otro grupo */}
      <ImportPredictionsButton
        targetGroupId={groupId}
        sourceGroups={sourceGroups}
      />

      {/* Extras: goleador, asistidor, MVP */}
      {hasExtras && (
        <ExtrasSection
          groupId={groupId}
          group={group!}
          existing={special as Pick<SpecialPrediction, 'top_scorer_name' | 'top_assist_name' | 'mvp_name'> | null}
          locked={locked}
        />
      )}

      <PredictionsPanel
        matches={matches}
        teams={teams}
        groupId={groupId}
        initialPredictions={Object.fromEntries(predictionMap)}
      />
    </div>
  )
}
