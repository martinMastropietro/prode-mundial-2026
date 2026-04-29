import type { Match } from '@/types'
import FlagIcon from '@/components/ui/FlagIcon'

const TZ = 'America/Buenos_Aires'

function dateKey(match: Match) {
  if (!match.match_date) return 'TBD'
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(match.match_date))
}

function formatDay(dateStr: string | null) {
  if (!dateStr) return 'Fecha por confirmar'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sortMatchesByDate(a: Match, b: Match) {
  if (!a.match_date && !b.match_date) return a.match_number - b.match_number
  if (!a.match_date) return 1
  if (!b.match_date) return -1
  return new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
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
  const matchesByDate = matches
    .slice()
    .sort(sortMatchesByDate)
    .reduce<Record<string, Match[]>>((acc, match) => {
      const key = dateKey(match)
      acc[key] = [...(acc[key] ?? []), match]
      return acc
    }, {})

  return (
    <div className="space-y-4">
      {Object.entries(matchesByDate).map(([date, dayMatches]) => (
        <section key={date} className="bg-[#1A1A2E] rounded-2xl border border-[#2A2D4A] overflow-hidden">
          <div className="bg-gradient-to-r from-[#C8102E]/20 to-[#003087]/20 px-4 py-3 border-b border-[#2A2D4A]">
            <h3 className="font-black text-sm tracking-widest text-[#FFB81C] uppercase">
              {formatDay(dayMatches[0]?.match_date)}
            </h3>
          </div>

          <div className="divide-y divide-[#2A2D4A]/50">
            {dayMatches.map(match => (
              <div key={match.id} className="px-4 py-3">
                <div className="text-[#8B8FA8] text-xs mb-2">
                  J{match.match_number} · {formatTime(match.match_date)}
                  {match.group_code && <span> · Grupo {match.group_code}</span>}
                  {match.city && <span> · {match.city}</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  {/* Local */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-medium text-sm text-right leading-tight">
                      {match.home_team?.name ?? 'Por definir'}
                    </span>
                    <FlagIcon team={match.home_team} className="flex-shrink-0" />
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center w-16 flex-shrink-0">
                    <ScoreBadge match={match} />
                  </div>

                  {/* Visitante */}
                  <div className="flex items-center gap-2 flex-1">
                    <FlagIcon team={match.away_team} className="flex-shrink-0" />
                    <span className="font-medium text-sm leading-tight">
                      {match.away_team?.name ?? 'Por definir'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
