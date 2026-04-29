import Image from 'next/image'
import type { Match, MatchPhase, Prediction, Team } from '@/types'
import { R32_BRACKET } from '@/lib/utils/simulate'
import type { MatchProjection, ProjectedQualifiers } from '@/lib/utils/simulate'
import FlagIcon from '@/components/ui/FlagIcon'

type BracketMatch = Match & { slotLabel: string }

// ─── ORDEN VISUAL CORRECTO DEL BRACKET ────────────────────────────────────────
// Principio: cada SF toma sus dos QF del MISMO LADO del bracket.
// Trazar el árbol completo desde la Final hacia atrás:
//
//  SF 101 = W97 + W98  → ambos QF van al lado IZQUIERDO
//    QF 97 = W(Oct89) + W(Oct90)   → Octavos izquierdos
//    QF 98 = W(Oct93) + W(Oct94)   → Octavos izquierdos
//      Oct 90 = W73+W75            → R32 izquierdos
//      Oct 89 = W74+W77            → R32 izquierdos
//      Oct 94 = W81+W82            → R32 izquierdos
//      Oct 93 = W83+W84            → R32 izquierdos
//
//  SF 102 = W99 + W100 → ambos QF van al lado DERECHO
//    QF 99  = W(Oct91) + W(Oct92)  → Octavos derechos
//    QF 100 = W(Oct95) + W(Oct96)  → Octavos derechos
//      Oct 91 = W76+W78            → R32 derechos
//      Oct 92 = W79+W80            → R32 derechos
//      Oct 95 = W86+W88            → R32 derechos
//      Oct 96 = W85+W87            → R32 derechos

const BRACKET_ORDER = {
  r32L:  [73, 75,  74, 77,  81, 82,  83, 84],  // → Oct 90,89,94,93 → QF 97,98 → SF 101
  r32R:  [76, 78,  79, 80,  86, 88,  85, 87],  // → Oct 91,92,95,96 → QF 99,100 → SF 102
  r16L:  [90, 89,  94, 93],                     // pares: 90+89→QF97, 94+93→QF98
  r16R:  [91, 92,  96, 95],                     // pares: 91+92→QF99, 96+95→QF100
  qfL:   [97, 98],                              // → SF 101
  qfR:   [99, 100],                             // → SF 102
  sfL:   [101],
  sfR:   [102],
}

function MatchBox({
  match, highlight, projectedHome, projectedAway, prediction, proj
}: {
  match: BracketMatch | null
  highlight?: boolean
  projectedHome?: Team | null
  projectedAway?: Team | null
  prediction?: Prediction
  proj?: MatchProjection | null
}) {
  if (!match) {
    return (
      <div className="w-44 bg-[#16213E] border border-[#2A2D4A] rounded-lg overflow-hidden opacity-40">
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#8B8FA8]">
          <FlagIcon team={null} />
          <span>Por definir</span>
        </div>
        <div className="border-t border-[#2A2D4A]" />
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#8B8FA8]">
          <FlagIcon team={null} />
          <span>Por definir</span>
        </div>
      </div>
    )
  }

  const finished = match.status === 'finished'
  const homeScore = finished ? match.home_score_full ?? match.home_score : prediction?.predicted_home_score
  const awayScore = finished ? match.away_score_full ?? match.away_score : prediction?.predicted_away_score
  const penWinner = finished ? match.penalty_winner : prediction?.predicted_penalty_winner
  const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined
  const homeWon = hasScore && (homeScore > awayScore || (homeScore === awayScore && penWinner === 'home'))
  const awayWon = hasScore && (awayScore > homeScore || (homeScore === awayScore && penWinner === 'away'))
  const homeTeam = match.home_team ?? projectedHome
  const awayTeam = match.away_team ?? projectedAway
  const homeProj = !match.home_team && !!projectedHome
  const awayProj = !match.away_team && !!projectedAway

  return (
    <div className={`w-44 border rounded-lg overflow-hidden text-xs ${
      highlight ? 'border-[#FFB81C]/50 bg-[#FFB81C]/5' : 'border-[#2A2D4A] bg-[#1A1A2E]'
    }`}>
      {/* Home row */}
      <div className={`flex items-center justify-between px-2 py-1.5 gap-1 ${homeWon ? 'bg-[#00A651]/15' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <FlagIcon team={homeTeam} />
          <span className={`truncate leading-tight text-xs ${
            homeWon ? 'font-black text-[#FFB81C]' :
            homeProj ? 'text-[#6699ff] italic' :
            homeTeam ? 'text-[#D0D0D0]' : 'text-[#8B8FA8]'
          }`}>
            {homeTeam?.name ?? 'Por definir'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {homeProj && <span className="text-[10px] text-[#6699ff]">proj.</span>}
          {hasScore && <span className={`font-black ${homeWon ? 'text-[#FFB81C]' : 'text-[#8B8FA8]'}`}>{homeScore}</span>}
        </div>
      </div>

      <div className="border-t border-[#2A2D4A]" />

      {/* Away row */}
      <div className={`flex items-center justify-between px-2 py-1.5 gap-1 ${awayWon ? 'bg-[#00A651]/15' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <FlagIcon team={awayTeam} />
          <span className={`truncate leading-tight text-xs ${
            awayWon ? 'font-black text-[#FFB81C]' :
            awayProj ? 'text-[#6699ff] italic' :
            awayTeam ? 'text-[#D0D0D0]' : 'text-[#8B8FA8]'
          }`}>
            {awayTeam?.name ?? 'Por definir'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {awayProj && <span className="text-[10px] text-[#6699ff]">proj.</span>}
          {hasScore && <span className={`font-black ${awayWon ? 'text-[#FFB81C]' : 'text-[#8B8FA8]'}`}>{awayScore}</span>}
        </div>
      </div>

      {/* Resultado en penales — real o proyectado */}
      {(() => {
        const penWinner = match.went_to_penalties && match.penalty_winner
          ? match.penalty_winner
          : proj?.penaltyWinner ?? null
        if (!penWinner) return null
        const penTeam = penWinner === 'home' ? homeTeam : awayTeam
        return (
          <div className="border-t border-[#2A2D4A] px-2 py-1 text-center text-[#FFB81C] font-bold text-[10px]">
            Pen. → {penTeam?.name ?? penWinner}
          </div>
        )
      })()}
    </div>
  )
}

function RoundColumn({ label, matchNums, byNum, projectedQualifiers, projectedMatches, predictionMap }: {
  label: string
  matchNums: number[]
  byNum: Map<number, Match>
  projectedQualifiers?: ProjectedQualifiers
  projectedMatches?: Record<number, MatchProjection>
  predictionMap?: Map<string, Prediction>
}) {
  return (
    <div className="flex flex-col flex-shrink-0" style={{ alignSelf: 'stretch' }}>
      <div className="text-[#FFB81C] text-xs font-bold uppercase tracking-wider mb-2 text-center">{label}</div>
      <div className="flex flex-col flex-1" style={{ justifyContent: 'space-evenly' }}>
        {matchNums.map(num => {
          const m = byNum.get(num) ?? null
          const bm = m ? { ...m, slotLabel: `P${num}` } as BracketMatch : null
          const slots = R32_BRACKET[num]
          const proj = projectedMatches?.[num]
          const projH = proj?.home ?? (slots ? projectedQualifiers?.get(slots[0]) : undefined)
          const projA = proj?.away ?? (slots ? projectedQualifiers?.get(slots[1]) : undefined)
          return (
            <MatchBox
              key={num}
              match={bm}
              projectedHome={projH}
              projectedAway={projA}
              prediction={m ? predictionMap?.get(m.id) : undefined}
              proj={proj}
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
  projectedMatches,
  predictionMap,
  showPredictionLegend = true,
}: {
  matches: Match[]
  projectedQualifiers?: ProjectedQualifiers
  projectedMatches?: Record<number, MatchProjection>
  predictionMap?: Map<string, Prediction>
  showPredictionLegend?: boolean
}) {
  const byNum = new Map(matches.map(m => [m.match_number, m]))
  const byPhase: Partial<Record<MatchPhase, Match[]>> = {}
  for (const m of matches) {
    if (!byPhase[m.phase]) byPhase[m.phase] = []
    byPhase[m.phase]!.push(m)
  }

  const fin = byPhase['final'] ?? []
  const tp  = byPhase['third_place'] ?? []
  const hasR32 = (byPhase['round_of_32']?.length ?? 0) > 0
  const hasProjection = !!projectedQualifiers || !!projectedMatches

  const divider = <div className="w-px bg-gradient-to-b from-transparent via-[#2A2D4A] to-transparent self-stretch flex-shrink-0" />
  const colProps = { byNum, projectedQualifiers, projectedMatches, predictionMap }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-max">
        <div className="flex items-stretch gap-3" style={{ minHeight: '520px' }}>
          {/* LEFT */}
          {hasR32 && <><RoundColumn label="32avos"   matchNums={BRACKET_ORDER.r32L} {...colProps} />{divider}</>}
          <RoundColumn label="Octavos"  matchNums={BRACKET_ORDER.r16L} {...colProps} />{divider}
          <RoundColumn label="Cuartos"  matchNums={BRACKET_ORDER.qfL}  {...colProps} />{divider}
          <RoundColumn label="Semifinal" matchNums={BRACKET_ORDER.sfL} {...colProps} />{divider}

          {/* CENTER */}
          {(() => {
            const finProj = fin[0] ? projectedMatches?.[fin[0].match_number] : undefined
            const finPred = fin[0] ? predictionMap?.get(fin[0].id) : undefined
            const tpProj  = tp[0]  ? projectedMatches?.[tp[0].match_number]  : undefined
            const tpPred  = tp[0]  ? predictionMap?.get(tp[0].id)  : undefined

            // Determinar campeón: resultado real > predicción del partido > penales
            function getWinner(
              match: Match | undefined,
              proj: MatchProjection | undefined,
              pred: Prediction | undefined
            ): Team | null {
              if (!match) return null
              if (match.status === 'finished' && match.home_score_full !== null && match.away_score_full !== null) {
                const hw = match.home_score_full > match.away_score_full
                const aw = match.away_score_full > match.home_score_full
                if (hw) return match.home_team ?? null
                if (aw) return match.away_team ?? null
                if (match.penalty_winner === 'home') return match.home_team ?? null
                if (match.penalty_winner === 'away') return match.away_team ?? null
              }
              // Usa predicción del partido (con equipos del proj)
              if (pred && proj) {
                const hg = pred.predicted_home_score
                const ag = pred.predicted_away_score
                const pen = pred.predicted_penalty_winner
                if (hg > ag) return proj.home ?? null
                if (ag > hg) return proj.away ?? null
                if (pen === 'home') return proj.home ?? null
                if (pen === 'away') return proj.away ?? null
              }
              return null
            }

            const champion  = getWinner(fin[0], finProj, finPred)
            const thirdPlace = getWinner(tp[0],  tpProj,  tpPred)

            return (
              <div className="flex flex-col items-center justify-center gap-3 flex-shrink-0 px-4" style={{ alignSelf: 'center' }}>

                {/* Campeón + copa */}
                <div className="text-center">
                  {champion ? (
                    // Con campeón: bandera izquierda + nombre + copa pequeña derecha
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <FlagIcon team={champion} />
                        <div className="text-left">
                          <div className="text-[#8B8FA8] text-[10px] uppercase tracking-wider">Campeón</div>
                          <div className="text-[#FFD700] font-black text-base leading-tight">{champion.name}</div>
                        </div>
                      </div>
                      <div className="relative w-8 h-12 flex-shrink-0 drop-shadow-[0_0_10px_rgba(255,184,28,0.5)]">
                        <Image src="/trophy.png" alt="Copa" fill className="object-contain" />
                      </div>
                    </div>
                  ) : (
                    // Sin campeón: solo la copa grande, sin texto
                    <div className="relative w-16 h-20 mx-auto mb-1 drop-shadow-[0_0_16px_rgba(255,184,28,0.5)]">
                      <Image src="/trophy.png" alt="FIFA World Cup" fill className="object-contain" />
                    </div>
                  )}
                  <div className="text-[#FFB81C] text-xs font-bold uppercase tracking-wider mt-2">Final</div>
                </div>

                <MatchBox
                  match={fin[0] ? { ...fin[0], slotLabel: 'Final' } as BracketMatch : null}
                  projectedHome={finProj?.home}
                  projectedAway={finProj?.away}
                  prediction={finPred}
                  proj={finProj}
                  highlight
                />

                {/* 3° Puesto */}
                <div className="mt-1 text-center w-full">
                  <div className="text-[#8B8FA8] text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center justify-center gap-2">
                    {thirdPlace && <span className="text-xl">{thirdPlace.flag_emoji}</span>}
                    3° Puesto
                    {thirdPlace && <span className="text-xl">{thirdPlace.flag_emoji}</span>}
                  </div>
                  <MatchBox
                    match={tp[0] ? { ...tp[0], slotLabel: '3°' } as BracketMatch : null}
                    projectedHome={tpProj?.home}
                    projectedAway={tpProj?.away}
                    prediction={tpPred}
                    proj={tpProj}
                  />
                </div>
              </div>
            )
          })()}

          {/* RIGHT */}
          {divider}<RoundColumn label="Semifinal" matchNums={BRACKET_ORDER.sfR} {...colProps} />
          {divider}<RoundColumn label="Cuartos"   matchNums={BRACKET_ORDER.qfR}  {...colProps} />
          {divider}<RoundColumn label="Octavos"   matchNums={BRACKET_ORDER.r16R} {...colProps} />
          {hasR32 && <>{divider}<RoundColumn label="32avos" matchNums={BRACKET_ORDER.r32R} {...colProps} /></>}
        </div>

        {hasProjection && (
          <div className="flex gap-4 mt-4 pt-3 border-t border-[#2A2D4A] text-xs text-[#8B8FA8]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#C8102E]/20 border border-[#C8102E]/30 inline-block" />
              Ganador
            </span>
            {showPredictionLegend && (
              <span className="flex items-center gap-1.5">
                <span className="text-[#6699ff] font-bold italic">proj.</span>
                Proyectado desde tus predicciones
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
