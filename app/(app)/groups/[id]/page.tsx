import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { RankingRow } from '@/types'

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

  // Check membership
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!membership) redirect('/dashboard')

  // Top ranking
  const { data: rankingRows } = await supabase
    .from('ranking_by_group')
    .select('*')
    .eq('group_id', id)
    .order('total_points', { ascending: false })
    .limit(5)

  const ranking = (rankingRows ?? []) as RankingRow[]
  const myRank = ranking.findIndex((r) => r.user_id === user!.id) + 1

  // Next match
  const { data: nextMatch } = await supabase
    .from('matches')
    .select('id, match_date, phase, home_team:home_team_id(name, flag_emoji), away_team:away_team_id(name, flag_emoji)')
    .eq('status', 'scheduled')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C8102E]/20 to-[#003087]/20 rounded-2xl p-6 border border-[#2A2D4A]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">{group.name}</h1>
            <button
              onClick={() => navigator.clipboard.writeText(group.public_id)}
              className="text-[#8B8FA8] text-sm mt-1 hover:text-white transition-colors flex items-center gap-1"
            >
              {group.public_id} <span className="text-xs">📋</span>
            </button>
          </div>
          {myRank > 0 && (
            <div className="text-right">
              <div className="text-[#8B8FA8] text-xs">Tu posición</div>
              <div className="text-3xl font-black text-[#FFB81C]">#{myRank}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: `/groups/${id}/matches`, icon: '⚽', label: 'Partidos' },
          { href: `/groups/${id}/rankings`, icon: '🏆', label: 'Ranking' },
          { href: `/groups/${id}/special`, icon: '⭐', label: 'Especiales' },
          ...(membership.role === 'admin' ? [{ href: `/groups/${id}/settings`, icon: '⚙️', label: 'Config' }] : []),
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-[#1A1A2E] hover:bg-[#16213E] rounded-xl p-4 border border-[#2A2D4A] transition-colors text-center"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </Link>
        ))}
      </div>

      {/* Top 3 */}
      {ranking.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-4">Ranking del grupo</h2>
          <div className="space-y-2">
            {ranking.map((row, i) => (
              <div
                key={row.user_id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  row.user_id === user!.id
                    ? 'bg-[#C8102E]/10 border-[#C8102E]/30'
                    : 'bg-[#1A1A2E] border-[#2A2D4A]'
                }`}
              >
                <span className={`text-xl font-black w-8 text-center ${
                  i === 0 ? 'text-[#FFB81C]' : i === 1 ? 'text-[#C0C0C0]' : i === 2 ? 'text-[#CD7F32]' : 'text-[#8B8FA8]'
                }`}>
                  #{i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#2A2D4A] flex items-center justify-center font-bold text-sm">
                  {(row.display_name ?? row.username)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{row.display_name ?? row.username}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FFB81C]">{row.total_points}</div>
                  <div className="text-[#8B8FA8] text-xs">pts</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href={`/groups/${id}/rankings`}
            className="block text-center text-[#C8102E] text-sm font-medium mt-3 hover:underline"
          >
            Ver ranking completo →
          </Link>
        </section>
      )}

      {/* Next match */}
      {nextMatch && (
        <section>
          <h2 className="font-bold text-lg mb-4">Próximo partido</h2>
          <Link
            href={`/groups/${id}/matches`}
            className="bg-[#1A1A2E] hover:bg-[#16213E] rounded-xl p-4 border border-[#2A2D4A] transition-colors block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{(nextMatch.home_team as any)?.flag_emoji ?? '🏳️'}</span>
                <span className="font-medium">{(nextMatch.home_team as any)?.name ?? 'Por definir'}</span>
                <span className="text-[#8B8FA8] text-sm">vs</span>
                <span className="font-medium">{(nextMatch.away_team as any)?.name ?? 'Por definir'}</span>
                <span className="text-2xl">{(nextMatch.away_team as any)?.flag_emoji ?? '🏳️'}</span>
              </div>
              <span className="text-[#C8102E] text-sm font-bold">Predecir →</span>
            </div>
            {nextMatch.match_date && (
              <p className="text-[#8B8FA8] text-xs mt-2">
                {new Date(nextMatch.match_date).toLocaleDateString('es-AR', {
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </Link>
        </section>
      )}
    </div>
  )
}
