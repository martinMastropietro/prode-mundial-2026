import type { Match } from '@/types'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    timeZone: 'America/Buenos_Aires',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScoreBadge({ match }: { match: Match }) {
  if (match.status === 'finished') {
    return (
      <span className="text-base font-black text-white">
        {match.home_score_full ?? match.home_score} – {match.away_score_full ?? match.away_score}
      </span>
    )
  }
  if (match.status === 'live') {
    return <span className="text-[#00A651] font-bold text-sm animate-pulse">EN VIVO</span>
  }
  return <span className="text-[#8B8FA8] text-sm">vs</span>
}

export default function GroupStageView({ matches }: { matches: Match[] }) {
  const byGroup = Object.fromEntries(
    GROUPS.map(g => [g, matches.filter(m => m.group_code === g)])
  )

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {GROUPS.map(group => {
        const gMatches = byGroup[group]
        if (!gMatches || gMatches.length === 0) return null

        return (
          <div key={group} className="bg-[#1A1A2E] rounded-2xl border border-[#2A2D4A] overflow-hidden">
            {/* Group header */}
            <div className="bg-gradient-to-r from-[#C8102E]/20 to-[#003087]/20 px-4 py-3 border-b border-[#2A2D4A]">
              <h3 className="font-black text-sm tracking-widest text-[#FFB81C]">GRUPO {group}</h3>
            </div>

            {/* Matches */}
            <div className="divide-y divide-[#2A2D4A]/50">
              {gMatches.map(match => (
                <div key={match.id} className="px-4 py-3">
                  <div className="text-[#8B8FA8] text-xs mb-2">
                    J{match.match_number} · {formatDate(match.match_date)}
                    {match.city && <span> · {match.city}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {/* Local */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-medium text-sm text-right leading-tight">
                        {match.home_team?.name ?? 'Por definir'}
                      </span>
                      <span className="text-xl flex-shrink-0">{match.home_team?.flag_emoji ?? '🏳️'}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-center w-16 flex-shrink-0">
                      <ScoreBadge match={match} />
                    </div>

                    {/* Visitante */}
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl flex-shrink-0">{match.away_team?.flag_emoji ?? '🏳️'}</span>
                      <span className="font-medium text-sm leading-tight">
                        {match.away_team?.name ?? 'Por definir'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
