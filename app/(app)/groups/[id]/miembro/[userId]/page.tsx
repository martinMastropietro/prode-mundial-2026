import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import MatchListReadOnly from '@/components/matches/MatchListReadOnly'
import type { Match, Prediction, Team } from '@/types'
import {
  simulateGroupStandings,
  buildProjectedQualifiers,
  buildFullBracketProjection,
} from '@/lib/utils/simulate'

type Props = { params: Promise<{ id: string; userId: string }> }

export default async function MemberPredictionPage({ params }: Props) {
  const { id: groupId, userId: targetUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // El viewer debe ser miembro del grupo
  const { data: myMembership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!myMembership) redirect('/dashboard')

  // Verificar que el target también es miembro
  const { data: targetMembership } = await supabase
    .from('group_members')
    .select('profile:profiles(username, display_name)')
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (!targetMembership) notFound()

  const targetProfile = targetMembership.profile as unknown as { username: string; display_name: string | null } | null
  const targetName = targetProfile?.display_name ?? targetProfile?.username ?? 'Usuario'
  const isOwnProfile = targetUserId === user!.id

  const { data: group } = await supabase
    .from('groups')
    .select('name, predictions_visible')
    .eq('id', groupId)
    .single()

  const [matchesRes, teamsRes, predictionsRes] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:home_team_id(id, name, code, flag_emoji, group_code), away_team:away_team_id(id, name, code, flag_emoji, group_code)')
      .order('match_number', { ascending: true }),
    supabase.from('teams').select('*'),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('group_id', groupId),
  ])

  const matches = (matchesRes.data ?? []) as unknown as Match[]
  const teams = (teamsRes.data ?? []) as Team[]
  const allPredictions = (predictionsRes.data ?? []) as unknown as Prediction[]

  // Filtrar predicciones según visibilidad
  // Si no es la propia cuenta Y el grupo no tiene predicciones visibles:
  // solo mostrar predicciones de partidos ya iniciados
  const now = new Date()
  const predictionMap = new Map<string, Prediction>()
  const matchById = new Map(matches.map(m => [m.id, m]))

  for (const p of allPredictions) {
    const match = matchById.get(p.match_id)
    if (!match) continue
    // Siempre mostrar si es la propia cuenta o si el grupo tiene predictions_visible=true
    // Solo mostrar si el partido ya empezó cuando predictions_visible=false
    if (!isOwnProfile && !group?.predictions_visible) {
      if (!match.match_date || new Date(match.match_date) > now) continue
    }
    predictionMap.set(p.match_id, p)
  }

  // Bracket projection basado en las predicciones del target
  const standings = simulateGroupStandings(matches, predictionMap, teams)
  const qualifiers = buildProjectedQualifiers(standings)
  const bracketProjection = buildFullBracketProjection(qualifiers, matches, predictionMap)

  const bracketProjectionObj: Record<number, { home: Team | null; away: Team | null }> = {}
  for (const [k, v] of bracketProjection) bracketProjectionObj[k] = v

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link href={`/groups/${groupId}/rankings`} className="text-[#8B8FA8] hover:text-white text-sm">
          ← Ranking
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 mt-3">
        <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center font-black text-lg">
          {targetName[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-black">{targetName}</h1>
          <p className="text-[#8B8FA8] text-xs">{group?.name}</p>
        </div>
        {isOwnProfile && (
          <span className="ml-auto text-xs text-[#8B8FA8] border border-[#2A2D4A] px-2 py-0.5 rounded-full">Tus predicciones</span>
        )}
      </div>

      {!isOwnProfile && !group?.predictions_visible && (
        <div className="bg-[#FFB81C]/10 border border-[#FFB81C]/20 rounded-xl px-4 py-2 mb-4 text-xs text-[#FFB81C]">
          Solo se muestran predicciones de partidos ya iniciados.
        </div>
      )}

      <MatchListReadOnly
        matches={matches}
        predictionMap={predictionMap}
        bracketProjection={bracketProjectionObj}
      />
    </div>
  )
}
