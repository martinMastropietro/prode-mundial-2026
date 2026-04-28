import type { Match, MatchPhase } from '@/types'

type BracketMatch = Match & {
  slotLabel: string
}

const PHASE_ORDER: MatchPhase[] = [
  'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'final', 'third_place'
]

const PHASE_LABELS: Record<string, string> = {
  round_of_32:  '32avos',
  round_of_16:  'Octavos',
  quarterfinal: 'Cuartos',
  semifinal:    'Semifinal',
  final:        'Final',
  third_place:  '3° Puesto',
}

function MatchBox({ match, highlight }: { match: BracketMatch | null; highlight?: boolean }) {
  if (!match) {
    return (
      <div className="w-44 bg-[#16213E] border border-[#2A2D4A] rounded-lg overflow-hidden opacity-40">
        <div className="px-2 py-1.5 text-xs text-[#8B8FA8]">TBD</div>
        <div className="border-t border-[#2A2D4A] px-2 py-1.5 text-xs text-[#8B8FA8]">TBD</div>
      </div>
    )
  }

  const home = match.home_team
  const away = match.away_team
  const finished = match.status === 'finished'
  const homeWon = finished && (match.home_score_full ?? 0) > (match.away_score_full ?? 0)
  const awayWon = finished && (match.away_score_full ?? 0) > (match.home_score_full ?? 0)

  return (
    <div className={`w-44 border rounded-lg overflow-hidden text-xs ${
      highlight
        ? 'border-[#FFB81C]/50 bg-[#FFB81C]/5'
        : 'border-[#2A2D4A] bg-[#1A1A2E]'
    }`}>
      {/* Home */}
      <div className={`px-2 py-1.5 flex items-center justify-between gap-1 ${
        homeWon ? 'bg-[#C8102E]/20' : ''
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none">{home?.flag_emoji ?? '🏳️'}</span>
          <span className={`truncate leading-tight ${homeWon ? 'font-bold text-white' : 'text-[#D0D0D0]'}`}>
            {home?.name ?? 'Por definir'}
          </span>
        </div>
        {finished && (
          <span className={`font-black flex-shrink-0 ${homeWon ? 'text-white' : 'text-[#8B8FA8]'}`}>
            {match.home_score_full ?? match.home_score ?? 0}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#2A2D4A]" />

      {/* Away */}
      <div className={`px-2 py-1.5 flex items-center justify-between gap-1 ${
        awayWon ? 'bg-[#C8102E]/20' : ''
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none">{away?.flag_emoji ?? '🏳️'}</span>
          <span className={`truncate leading-tight ${awayWon ? 'font-bold text-white' : 'text-[#D0D0D0]'}`}>
            {away?.name ?? 'Por definir'}
          </span>
        </div>
        {finished && (
          <span className={`font-black flex-shrink-0 ${awayWon ? 'text-white' : 'text-[#8B8FA8]'}`}>
            {match.away_score_full ?? match.away_score ?? 0}
          </span>
        )}
      </div>

      {/* Penales */}
      {match.went_to_penalties && match.penalty_winner && (
        <div className="border-t border-[#2A2D4A] px-2 py-1 text-center text-[#FFB81C] font-bold">
          Pen. → {match.penalty_winner === 'home' ? home?.name : away?.name}
        </div>
      )}
    </div>
  )
}

function RoundColumn({
  label,
  matches,
  alignEnd,
}: {
  label: string
  matches: (BracketMatch | null)[]
  alignEnd?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 flex-shrink-0">
      <div className={`text-[#FFB81C] text-xs font-bold uppercase tracking-wider mb-2 text-center`}>
        {label}
      </div>
      <div
        className="flex flex-col"
        style={{
          gap: `${Math.max(8, 28 / matches.length)}px`,
          justifyContent: 'space-around',
          height: '100%',
        }}
      >
        {matches.map((m, i) => (
          <MatchBox key={m?.id ?? `empty-${i}`} match={m} />
        ))}
      </div>
    </div>
  )
}

export default function KnockoutBracket({ matches }: { matches: Match[] }) {
  const byPhase: Partial<Record<MatchPhase, Match[]>> = {}
  for (const m of matches) {
    if (!byPhase[m.phase]) byPhase[m.phase] = []
    byPhase[m.phase]!.push(m)
  }

  const r32 = byPhase['round_of_32'] ?? []
  const r16 = byPhase['round_of_16'] ?? []
  const qf  = byPhase['quarterfinal'] ?? []
  const sf  = byPhase['semifinal'] ?? []
  const fin = byPhase['final'] ?? []
  const tp  = byPhase['third_place'] ?? []

  const toBM = (ms: Match[]): (BracketMatch | null)[] =>
    ms.map(m => ({ ...m, slotLabel: `P${m.match_number}` }))

  const pad = (ms: Match[], n: number): (BracketMatch | null)[] => {
    const result = toBM(ms)
    while (result.length < n) result.push(null)
    return result
  }

  const half = <T,>(arr: T[]): [T[], T[]] => {
    const mid = Math.ceil(arr.length / 2)
    return [arr.slice(0, mid), arr.slice(mid)]
  }

  const [r32L, r32R] = half(pad(r32, 16))
  const [r16L, r16R] = half(pad(r16, 8))
  const [qfL,  qfR]  = half(pad(qf,  4))
  const [sfL,  sfR]  = half(pad(sf,  2))

  const hasR32 = r32.length > 0

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-max">

        {/* Main bracket */}
        <div className="flex items-stretch gap-4">
          {/* LEFT SIDE */}
          {hasR32 && (
            <RoundColumn label="32avos" matches={r32L} />
          )}
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          <RoundColumn label="Octavos" matches={r16L} />
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          <RoundColumn label="Cuartos" matches={qfL} />
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          <RoundColumn label="Semifinal" matches={sfL} />
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          {/* CENTER: FINAL */}
          <div className="flex flex-col items-center justify-center gap-4 flex-shrink-0 px-4">
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-[#FFB81C] text-xs font-bold uppercase tracking-wider">Final</div>
            </div>
            <MatchBox match={fin[0] ? { ...fin[0], slotLabel: 'Final' } : null} highlight />
            <div className="mt-4 text-center">
              <div className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider">3° Puesto</div>
              <div className="mt-2">
                <MatchBox match={tp[0] ? { ...tp[0], slotLabel: '3° Puesto' } : null} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />
          <RoundColumn label="Semifinal" matches={sfR} />
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          <RoundColumn label="Cuartos" matches={qfR} />
          <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

          <RoundColumn label="Octavos" matches={r16R} />

          {hasR32 && (
            <>
              <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />
              <RoundColumn label="32avos" matches={r32R} />
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-8 pt-4 border-t border-[#2A2D4A] text-xs text-[#8B8FA8]">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#C8102E]/20 border border-[#C8102E]/30 inline-block" />
            Equipo ganador
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#FFB81C]/5 border border-[#FFB81C]/50 inline-block" />
            Partido destacado
          </span>
        </div>
      </div>
    </div>
  )
}
