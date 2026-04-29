import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { RankingRow } from '@/types'
import { normalizePredictionMode, PREDICTION_MODE_LABELS } from '@/lib/utils/predictionModes'

type Props = { params: Promise<{ id: string }> }

export default async function GroupHomePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (!group) notFound()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!membership) redirect('/dashboard')

  const { data: rankingRows, error: rankingError } = await supabase
    .from('ranking_by_group')
    .select('*')
    .eq('group_id', id)
    .order('total_points', { ascending: false })

  const ranking = (rankingRows ?? []) as RankingRow[]
  const myRank = ranking.findIndex((r) => r.user_id === user!.id) + 1
  const medals = ['🥇', '🥈', '🥉']
  const predictionMode = normalizePredictionMode(group.prediction_mode)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C8102E]/20 to-[#003087]/20 rounded-2xl p-5 border border-[#2A2D4A]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">{group.name}</h1>
            <p className="text-[#8B8FA8] text-sm font-mono mt-0.5">{group.public_id}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 bg-[#003087]/30 text-[#6699ff] rounded-full">
                {PREDICTION_MODE_LABELS[predictionMode]}
              </span>
              {group.predictions_visible && (
                <span className="text-xs px-2 py-0.5 bg-[#003087]/30 text-[#6699ff] rounded-full">Predicciones visibles</span>
              )}
              {group.has_top_scorer && (
                <span className="text-xs px-2 py-0.5 bg-[#FFB81C]/20 text-[#FFB81C] rounded-full">⚽ Goleador</span>
              )}
              {group.has_top_assist && (
                <span className="text-xs px-2 py-0.5 bg-[#FFB81C]/20 text-[#FFB81C] rounded-full">🎯 Asistidor</span>
              )}
              {group.has_mvp && (
                <span className="text-xs px-2 py-0.5 bg-[#FFB81C]/20 text-[#FFB81C] rounded-full">⭐ MVP</span>
              )}
            </div>
          </div>
          {myRank > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="text-[#8B8FA8] text-xs">Tu posición</div>
              <div className="text-3xl font-black text-[#FFB81C]">
                {myRank <= 3 ? medals[myRank - 1] : `#${myRank}`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: `/groups/${id}/matches`,   icon: '⚽', label: 'Predicciones' },
          { href: `/groups/${id}/rankings`,  icon: '🏆', label: 'Ranking' },
          membership.role === 'admin'
            ? { href: `/groups/${id}/settings`, icon: '⚙️', label: 'Config' }
            : { href: `/groups/${id}/matches`,  icon: '📅', label: 'Predecir' },
        ].map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="bg-[#1A1A2E] hover:bg-[#16213E] rounded-xl p-4 border border-[#2A2D4A] transition-colors text-center"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </Link>
        ))}
      </div>

      {/* Ranking table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Tabla de posiciones</h2>
          <Link href={`/groups/${id}/rankings`} className="text-[#C8102E] text-sm hover:underline">
            Ver completo →
          </Link>
        </div>

        {rankingError ? (
          <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#C8102E]/30 text-[#C8102E] text-sm">
            Error cargando ranking. Ejecutá las migraciones SQL pendientes.
          </div>
        ) : ranking.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-xl p-6 border border-[#2A2D4A] text-center text-[#8B8FA8] text-sm">
            Todavía nadie tiene puntos. ¡Cargá predicciones!
          </div>
        ) : (
          <div className="bg-[#1A1A2E] rounded-2xl border border-[#2A2D4A] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-3 px-4 py-2 text-[#8B8FA8] text-xs font-medium uppercase tracking-wide border-b border-[#2A2D4A]">
              <span>#</span>
              <span>Jugador</span>
              <span className="text-right">Pts</span>
              <span className="text-right pr-1">✓</span>
            </div>

            {ranking.map((row, i) => {
              const isMe = row.user_id === user!.id
              return (
                <div
                  key={row.user_id}
                  className={`grid grid-cols-[2.5rem_1fr_auto_auto] gap-3 items-center px-4 py-3 border-b border-[#2A2D4A]/40 last:border-0 transition-colors ${
                    isMe ? 'bg-[#C8102E]/10' : 'hover:bg-[#16213E]'
                  }`}
                >
                  <span className={`font-black text-sm ${
                    i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-[#C0C0C0]' : i === 2 ? 'text-[#CD7F32]' : 'text-[#8B8FA8]'
                  }`}>
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-7 h-7 rounded-full bg-[#2A2D4A] flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                      {row.avatar_url ? (
                        <Image
                          src={row.avatar_url}
                          alt=""
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      ) : (
                        (row.display_name ?? row.username)[0].toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {row.display_name ?? row.username}
                      {isMe && <span className="text-[#8B8FA8] ml-1 text-xs">(vos)</span>}
                    </span>
                  </div>

                  <span className="font-black text-[#FFB81C] text-sm">{row.total_points}</span>
                  <span className="text-[#8B8FA8] text-xs pr-1">{row.correct_predictions}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
