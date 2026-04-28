import type { Match, MatchPhase, Team } from '@/types'
import { R32_BRACKET } from '@/lib/utils/simulate'
import type { ProjectedQualifiers } from '@/lib/utils/simulate'

type BracketMatch = Match & { slotLabel: string }

const PHASE_LABELS: Record<string, string> = {
  round_of_32: '32avos',
  round_of_16: 'Octavos',
  quarterfinal: 'Cuartos',
  semifinal: 'Semifinal',
  final: 'Final',
  third_place: '3° Puesto',
}

function TeamSlot({
  team, projected, isWinner
}: {
  team: Team | null | undefined
  projected?: Team | null
  isWinner?: boolean
}) {
  const display = team ?? projected
  const isProjected = !team && !!projected

  return (
    <div className={`px-2 py-1.5 flex items-center justify-between gap-1 ${isWinner ? 'bg-[#C8102E]/20' : ''}`}>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-base leading-none">{display?.flag_emoji ?? '🏳️'}</span>
        <span className={`truncate leading-tight text-xs ${
          isWinner ? 'font-bold text-white' :
          isProjected ? 'text-[#6699ff] italic' :
          display ? 'text-[#D0D0D0]' : 'text-[#8B8FA8]'
        }`}>
          {display?.name ?? 'Por definir'}
        </span>
      </div>
      {isProjected && (
        <span className="text-[10px] text-[#6699ff] flex-shrink-0">proj.</span>
      )}
    </div>
  )
}

function MatchBox({
  match, highlight, projectedHome, projectedAway
}: {
  match: BracketMatch | null
  highlight?: boolean
  projectedHome?: Team | null
  projectedAway?: Team | null
}) {
  if (!match) {
    return (
      <div className="w-44 bg-[#16213E] border border-[#2A2D4A] rounded-lg overflow-hidden opacity-40">
        <TeamSlot team={null} />
        <div className="border-t border-[#2A2D4A]" />
        <TeamSlot team={null} />
      </div>
    )
  }

  const finished = match.status === 'finished'
  const homeWon = finished && (match.home_score_full ?? 0) > (match.away_score_full ?? 0)
  const awayWon = finished && (match.away_score_full ?? 0) > (match.home_score_full ?? 0)

  return (
    <div className={`w-44 border rounded-lg overflow-hidden text-xs ${
      highlight ? 'border-[#FFB81C]/50 bg-[#FFB81C]/5' : 'border-[#2A2D4A] bg-[#1A1A2E]'
    }`}>
      <div className={homeWon ? 'bg-[#C8102E]/20' : ''}>
        <div className="flex items-center justify-between px-2 py-1.5 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none">{match.home_team?.flag_emoji ?? projectedHome?.flag_emoji ?? '🏳️'}</span>
            <span className={`truncate leading-tight text-xs ${
              homeWon ? 'font-bold text-white' :
              (!match.home_team && projectedHome) ? 'text-[#6699ff] italic' :
              match.home_team ? 'text-[#D0D0D0]' : 'text-[#8B8FA8]'
            }`}>
              {match.home_team?.name ?? projectedHome?.name ?? 'Por definir'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!match.home_team && projectedHome && <span className="text-[10px] text-[#6699ff]">proj.</span>}
            {finished && <span className={`font-black ${homeWon ? 'text-white' : 'text-[#8B8FA8]'}`}>{match.home_score_full ?? match.home_score ?? 0}</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-[#2A2D4A]" />

      <div className={awayWon ? 'bg-[#C8102E]/20' : ''}>
        <div className="flex items-center justify-between px-2 py-1.5 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none">{match.away_team?.flag_emoji ?? projectedAway?.flag_emoji ?? '🏳️'}</span>
            <span className={`truncate leading-tight text-xs ${
              awayWon ? 'font-bold text-white' :
              (!match.away_team && projectedAway) ? 'text-[#6699ff] italic' :
              match.away_team ? 'text-[#D0D0D0]' : 'text-[#8B8FA8]'
            }`}>
              {match.away_team?.name ?? projectedAway?.name ?? 'Por definir'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!match.away_team && projectedAway && <span className="text-[10px] text-[#6699ff]">proj.</span>}
            {finished && <span className={`font-black ${awayWon ? 'text-white' : 'text-[#8B8FA8]'}`}>{match.away_score_full ?? match.away_score ?? 0}</span>}
          </div>
        </div>
      </div>

      {match.went_to_penalties && match.penalty_winner && (
        <div className="border-t border-[#2A2D4A] px-2 py-1 text-center text-[#FFB81C] font-bold text-[10px]">
          Pen. → {match.penalty_winner === 'home' ? match.home_team?.name : match.away_team?.name}
        </div>
      )}
    </div>
  )
}

function RoundColumn({ label, matches, projectedQualifiers }: {
  label: string
  matches: (BracketMatch | null)[]
  projectedQualifiers?: ProjectedQualifiers
}) {
  return (
    <div className="flex flex-col gap-1 flex-shrink-0">
      <div className="text-[#FFB81C] text-xs font-bold uppercase tracking-wider mb-2 text-center">{label}</div>
      <div className="flex flex-col" style={{ gap: '8px', justifyContent: 'space-around' }}>
        {matches.map((m, i) => {
          const slots = m ? R32_BRACKET[m.match_number] : null
          const projH = slots ? projectedQualifiers?.get(slots[0]) : undefined
          const projA = slots ? projectedQualifiers?.get(slots[1]) : undefined
          return (
            <MatchBox
              key={m?.id ?? `empty-${i}`}
              match={m}
              projectedHome={projH}
              projectedAway={projA}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function KnockoutBracket({
  matches,
  projectedQualifiers,
}: {
  matches: Match[]
  projectedQualifiers?: ProjectedQualifiers
}) {
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
  const [qfL,  qfR]  = half(pad(qf, 4))
  const [sfL,  sfR]  = half(pad(sf, 2))
  const hasR32 = r32.length > 0

  const divider = <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-max">
        <div className="flex items-stretch gap-3">
          {hasR32 && <><RoundColumn label="32avos" matches={r32L} projectedQualifiers={projectedQualifiers} />{divider}</>}
          <RoundColumn label="Octavos" matches={r16L} />{divider}
          <RoundColumn label="Cuartos" matches={qfL} />{divider}
          <RoundColumn label="Semifinal" matches={sfL} />{divider}

          {/* Center */}
          <div className="flex flex-col items-center justify-center gap-4 flex-shrink-0 px-4">
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-[#FFB81C] text-xs font-bold uppercase tracking-wider">Final</div>
            </div>
            <MatchBox match={fin[0] ? { ...fin[0], slotLabel: 'Final' } : null} highlight />
            <div className="mt-4 text-center">
              <div className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-2">3° Puesto</div>
              <MatchBox match={tp[0] ? { ...tp[0], slotLabel: '3°' } : null} />
            </div>
          </div>

          {divider}<RoundColumn label="Semifinal" matches={sfR} />
          {divider}<RoundColumn label="Cuartos" matches={qfR} />
          {divider}<RoundColumn label="Octavos" matches={r16R} />
          {hasR32 && <>{divider}<RoundColumn label="32avos" matches={r32R} projectedQualifiers={projectedQualifiers} /></>}
        </div>

        <div className="flex gap-6 mt-6 pt-4 border-t border-[#2A2D4A] text-xs text-[#8B8FA8]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#C8102E]/20 border border-[#C8102E]/30 inline-block" />
            Ganador
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#6699ff] font-bold">proj.</span>
            Proyectado desde tus predicciones
          </span>
        </div>
      </div>
    </div>
  )
}
