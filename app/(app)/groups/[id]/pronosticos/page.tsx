import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function PronosticosPage({ params }: Props) {
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

  const { data: group } = await supabase
    .from('groups')
    .select('name, predictions_visible')
    .eq('id', groupId)
    .single()

  // Miembros del grupo
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, profile:profiles(username, display_name)')
    .eq('group_id', groupId)
    .order('joined_at')

  // Partidos (solo los que ya empezaron o predicciones visibles)
  const now = new Date().toISOString()
  let matchesQuery = supabase
    .from('matches')
    .select('id, match_number, phase, group_code, match_date, status, home_team:home_team_id(name, flag_emoji), away_team:away_team_id(name, flag_emoji), home_score_full, away_score_full')
    .order('match_number', { ascending: true })

  if (!group?.predictions_visible) {
    // Solo mostrar predicciones de partidos ya comenzados
    matchesQuery = matchesQuery.lte('match_date', now)
  }

  const { data: matches } = await matchesQuery

  // Predicciones de todos los miembros del grupo
  const { data: predictions } = await supabase
    .from('predictions')
    .select('match_id, user_id, predicted_home_score, predicted_away_score, predicted_penalty_winner, points_earned')
    .eq('group_id', groupId)

  // Indexar predicciones: predMap[user_id][match_id]
  const predMap: Record<string, Record<string, { h: number; a: number; pen?: string | null; pts: number }>> = {}
  for (const p of predictions ?? []) {
    if (!predMap[p.user_id]) predMap[p.user_id] = {}
    predMap[p.user_id][p.match_id] = {
      h: p.predicted_home_score,
      a: p.predicted_away_score,
      pen: p.predicted_penalty_winner,
      pts: p.points_earned,
    }
  }

  const memberList = (members ?? []).map(m => ({
    userId: m.user_id,
    name: (m.profile as any)?.display_name ?? (m.profile as any)?.username ?? m.user_id,
    isMe: m.user_id === user!.id,
  }))

  const matchList = matches ?? []

  // Agrupar por fase
  const phases: Record<string, typeof matchList> = {}
  for (const m of matchList) {
    if (!phases[m.phase]) phases[m.phase] = []
    phases[m.phase].push(m)
  }

  const PHASE_LABELS: Record<string, string> = {
    group: 'Fase de grupos', round_of_32: 'Ronda de 32', round_of_16: 'Octavos',
    quarterfinal: 'Cuartos', semifinal: 'Semifinal', third_place: '3° Puesto', final: 'Final',
  }

  if (matchList.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-black mb-2">Pronósticos del grupo</h1>
        <p className="text-[#8B8FA8] text-sm">{group?.name}</p>
        <div className="mt-8 text-center text-[#8B8FA8]">
          {group?.predictions_visible
            ? 'Todavía no hay predicciones cargadas.'
            : 'Los pronósticos de tus amigos se muestran una vez que el partido comienza.'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Pronósticos del grupo</h1>
      <p className="text-[#8B8FA8] text-sm mb-1">{group?.name}</p>
      {!group?.predictions_visible && (
        <p className="text-xs text-[#FFB81C] mb-4">
          Solo se muestran pronósticos de partidos ya iniciados. El admin puede cambiar esto en Config.
        </p>
      )}

      <div className="space-y-8">
        {Object.entries(phases).map(([phase, phaseMatches]) => (
          <section key={phase}>
            <h2 className="text-sm font-black text-[#FFB81C] uppercase tracking-wider mb-3">
              {PHASE_LABELS[phase] ?? phase}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-[#2A2D4A]">
                    <th className="text-left py-2 pr-4 text-[#8B8FA8] font-medium text-xs w-48">Partido</th>
                    <th className="text-center py-2 px-2 text-[#8B8FA8] font-medium text-xs w-16">Real</th>
                    {memberList.map(m => (
                      <th key={m.userId} className={`text-center py-2 px-3 text-xs font-medium whitespace-nowrap ${m.isMe ? 'text-[#FFB81C]' : 'text-[#8B8FA8]'}`}>
                        {m.name}{m.isMe ? ' (vos)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {phaseMatches.map((match: any) => {
                    const hasResult = match.status === 'finished'
                    return (
                      <tr key={match.id} className="border-b border-[#2A2D4A]/30 hover:bg-[#1A1A2E]/50 transition-colors">
                        {/* Partido */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span>{match.home_team?.flag_emoji ?? '🏳️'}</span>
                            <span className="text-xs text-[#D0D0D0]">{match.home_team?.name ?? '?'}</span>
                            <span className="text-[#8B8FA8] text-xs">vs</span>
                            <span className="text-xs text-[#D0D0D0]">{match.away_team?.name ?? '?'}</span>
                            <span>{match.away_team?.flag_emoji ?? '🏳️'}</span>
                          </div>
                        </td>

                        {/* Resultado real */}
                        <td className="text-center py-3 px-2">
                          {hasResult ? (
                            <span className="font-black text-white">
                              {match.home_score_full}-{match.away_score_full}
                            </span>
                          ) : (
                            <span className="text-[#8B8FA8] text-xs">-</span>
                          )}
                        </td>

                        {/* Predicción de cada miembro */}
                        {memberList.map(m => {
                          const pred = predMap[m.userId]?.[match.id]
                          if (!pred) return (
                            <td key={m.userId} className="text-center py-3 px-3">
                              <span className="text-[#2A2D4A] text-xs">—</span>
                            </td>
                          )

                          const correct = hasResult && (
                            pred.h === match.home_score_full && pred.a === match.away_score_full
                          )
                          const correctResult = hasResult && !correct && pred.pts > 0

                          return (
                            <td key={m.userId} className="text-center py-3 px-3">
                              <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-bold text-xs ${
                                correct ? 'bg-[#00A651]/20 text-[#00A651]' :
                                correctResult ? 'bg-[#FFB81C]/20 text-[#FFB81C]' :
                                hasResult ? 'bg-[#C8102E]/10 text-[#8B8FA8]' :
                                m.isMe ? 'text-white' : 'text-[#D0D0D0]'
                              }`}>
                                {pred.h}-{pred.a}
                                {pred.pen && <span className="text-[10px] ml-0.5">{pred.pen === 'home' ? '↑' : '↓'}</span>}
                              </div>
                              {hasResult && pred.pts > 0 && (
                                <div className="text-[10px] text-[#FFB81C] mt-0.5">+{pred.pts}</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
