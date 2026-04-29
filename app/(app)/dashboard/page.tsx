import { createClient } from '@/lib/supabase/server'
import FlagIcon from '@/components/ui/FlagIcon'
import Link from 'next/link'
import { PHASE_LABELS } from '@/lib/utils/points'
import type { MatchPhase, Team } from '@/types'

type UpcomingMatch = {
  id: string
  phase: MatchPhase
  group_code: string | null
  match_date: string | null
  city: string | null
  stadium: string | null
  home_team: Pick<Team, 'name' | 'code' | 'flag_emoji'> | null
  away_team: Pick<Team, 'name' | 'code' | 'flag_emoji'> | null
}

function matchMeta(match: UpcomingMatch) {
  const venue = [match.city, match.stadium].filter(Boolean).join(', ')
  return [
    PHASE_LABELS[match.phase] ?? match.phase,
    match.phase === 'group' && match.group_code ? `Grupo ${match.group_code}` : null,
    venue || null,
  ].filter(Boolean).join(' · ')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user!.id)
    .single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('role, group:groups(id, public_id, name)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  const groups = memberships?.map((m) => ({
    ...(m.group as unknown as { id: string; public_id: string; name: string }),
    role: m.role,
  })) ?? []

  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('id, match_number, phase, group_code, match_date, city, stadium, status, home_team:home_team_id(name, flag_emoji, code), away_team:away_team_id(name, flag_emoji, code)')
    .eq('status', 'scheduled')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })
    .limit(5)
  const matches = (upcomingMatches ?? []) as unknown as UpcomingMatch[]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black">
          Hola, {profile?.display_name ?? profile?.username} 👋
        </h1>
        <p className="text-[#8B8FA8] mt-1">¿Listo para el Mundial?</p>
      </div>

      {/* My groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Mis grupos</h2>
          <Link href="/groups/create" className="text-[#C8102E] text-sm font-medium hover:underline">
            + Crear grupo
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-2xl p-8 border border-[#2A2D4A] text-center">
            <p className="text-[#8B8FA8] mb-4">No pertenecés a ningún grupo todavía.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/groups/create"
                className="px-6 py-2 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold rounded-xl transition-colors text-sm"
              >
                Crear grupo
              </Link>
              <Link
                href="/groups/join"
                className="px-6 py-2 bg-[#16213E] hover:bg-[#1A1A2E] text-white font-bold rounded-xl border border-[#2A2D4A] transition-colors text-sm"
              >
                Unirse a un grupo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="bg-[#1A1A2E] hover:bg-[#16213E] rounded-2xl p-5 border border-[#2A2D4A] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">{group.name}</div>
                  <div className="text-[#8B8FA8] text-sm mt-0.5">{group.public_id}</div>
                </div>
                <div className="flex items-center gap-3">
                  {group.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-[#FFB81C]/20 text-[#FFB81C] text-xs font-bold rounded-full">
                      ADMIN
                    </span>
                  )}
                  <span className="text-[#8B8FA8]">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming matches */}
      <section>
        <h2 className="font-bold text-lg mb-4">Próximos partidos</h2>
        {matches.length === 0 ? (
          <p className="text-[#8B8FA8] text-sm">No hay partidos programados próximamente.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <FlagIcon team={match.home_team} className="flex-shrink-0" />
                      <span className="font-medium text-sm">{match.home_team?.name ?? 'Por definir'}</span>
                      <span className="text-[#8B8FA8] text-xs">vs</span>
                      <span className="font-medium text-sm">{match.away_team?.name ?? 'Por definir'}</span>
                      <FlagIcon team={match.away_team} className="flex-shrink-0" />
                    </div>
                    <div className="mt-2 text-xs text-[#8B8FA8] leading-snug">
                      {matchMeta(match)}
                    </div>
                  </div>
                  <div className="text-[#8B8FA8] text-xs flex-shrink-0 pt-0.5">
                    {match.match_date
                      ? new Date(match.match_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                      : 'TBD'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
