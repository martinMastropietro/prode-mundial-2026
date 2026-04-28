import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { RankingRow } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function GroupRankingPage({ params }: Props) {
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

  const { data: rows } = await supabase
    .from('ranking_by_group')
    .select('*')
    .eq('group_id', groupId)
    .order('total_points', { ascending: false })

  const ranking = (rows ?? []) as RankingRow[]

  const medalColors = ['text-[#FFB81C]', 'text-[#C0C0C0]', 'text-[#CD7F32]']
  const podiumBg = ['bg-[#FFB81C]/10 border-[#FFB81C]/30', 'bg-[#C0C0C0]/10 border-[#C0C0C0]/30', 'bg-[#CD7F32]/10 border-[#CD7F32]/30']

  return (
    <div>
      <h1 className="text-2xl font-black mb-2">Ranking</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">{group?.name}</p>

      {/* Podium top 3 */}
      {ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[ranking[1], ranking[0], ranking[2]].map((row, podiumPos) => {
            const rank = podiumPos === 0 ? 1 : podiumPos === 1 ? 0 : 2
            const actualRank = rank + 1
            return (
              <div
                key={row.user_id}
                className={`rounded-xl p-3 border text-center ${podiumBg[rank]} ${rank === 0 ? 'transform -translate-y-2' : ''}`}
              >
                <div className={`text-xl font-black ${medalColors[rank]}`}>
                  {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#2A2D4A] flex items-center justify-center font-bold mx-auto my-2">
                  {(row.display_name ?? row.username)[0].toUpperCase()}
                </div>
                <div className="text-xs font-medium truncate">{row.display_name ?? row.username}</div>
                <div className={`font-black text-lg ${medalColors[rank]}`}>{row.total_points}</div>
                <div className="text-[#8B8FA8] text-xs">pts</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-[#1A1A2E] rounded-2xl border border-[#2A2D4A] overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_4rem_4rem] gap-4 px-4 py-3 text-[#8B8FA8] text-xs font-medium uppercase tracking-wide border-b border-[#2A2D4A]">
          <span>#</span>
          <span>Jugador</span>
          <span className="text-right">Pts</span>
          <span className="text-right">Aciertos</span>
        </div>

        {ranking.map((row, i) => (
          <div
            key={row.user_id}
            className={`grid grid-cols-[2rem_1fr_auto_4rem_4rem] gap-3 items-center px-4 py-3 border-b border-[#2A2D4A]/50 last:border-0 ${
              row.user_id === user!.id ? 'bg-[#C8102E]/10' : ''
            }`}
          >
            <span className={`font-black text-sm ${i < 3 ? medalColors[i] : 'text-[#8B8FA8]'}`}>
              {i + 1}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#2A2D4A] flex items-center justify-center font-bold text-xs shrink-0">
                {(row.display_name ?? row.username)[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">
                {row.display_name ?? row.username}
                {row.user_id === user!.id && <span className="text-[#8B8FA8] ml-1 text-xs">(vos)</span>}
              </span>
            </div>
            {/* Ver predicciones — visible siempre (propias) o si predictions_visible=true */}
            {(row.user_id === user!.id || group?.predictions_visible) && (
              <Link
                href={`/groups/${groupId}/miembro/${row.user_id}`}
                className="text-xs text-[#6699ff] hover:text-white transition-colors whitespace-nowrap"
              >
                Ver →
              </Link>
            )}
            {!(row.user_id === user!.id || group?.predictions_visible) && (
              <span />
            )}
            <span className="text-right font-bold text-[#FFB81C]">{row.total_points}</span>
            <span className="text-right text-[#8B8FA8] text-sm">{row.correct_predictions}</span>
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="text-center text-[#8B8FA8] text-sm py-12">
            Todavía no hay puntos. ¡Predecí partidos!
          </div>
        )}
      </div>
    </div>
  )
}
