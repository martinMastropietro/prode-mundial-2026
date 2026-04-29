'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { isMatchClosed, getDisplayStatus, formatMatchDate } from '@/lib/utils/dates'
import { savePrediction } from '@/app/(app)/groups/[id]/matches/actions'
import type { Match, Prediction, Team } from '@/types'
import FlagIcon from '@/components/ui/FlagIcon'
import { isPredictionOpenForMode, normalizePredictionMode, type PredictionMode } from '@/lib/utils/predictionModes'

type Props = {
  match: Match
  prediction?: Prediction
  groupId: string
  predictionMode?: PredictionMode
  phaseCloseDate?: string | null
  projectedHome?: Team | null
  projectedAway?: Team | null
  onPredictionChange?: (
    matchId: string,
    homeGoals: number | null,
    awayGoals: number | null,
    penaltyWinner: 'home' | 'away' | null
  ) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const isKnockout = (phase: string) => phase !== 'group'

export default function MatchCard({ match, prediction, groupId, predictionMode, phaseCloseDate, projectedHome, projectedAway, onPredictionChange }: Props) {
  const mode = normalizePredictionMode(predictionMode)
  const closed = mode === 'full_bracket'
    ? isMatchClosed(match.match_date, match.status)
    : !isPredictionOpenForMode(mode, match.phase, match.match_date, match.status, phaseCloseDate)
  const knockout = isKnockout(match.phase)

  // Use real teams if available, otherwise projected
  const homeTeam = match.home_team ?? projectedHome ?? null
  const awayTeam = match.away_team ?? projectedAway ?? null
  const hasTeams = !!homeTeam && !!awayTeam
  const isProjected = !match.home_team && !!projectedHome

  const [homeGoals, setHomeGoals] = useState(prediction?.predicted_home_score?.toString() ?? '')
  const [awayGoals, setAwayGoals] = useState(prediction?.predicted_away_score?.toString() ?? '')
  const [penWinner, setPenWinner] = useState<'home' | 'away' | null>(
    prediction?.predicted_penalty_winner ?? null
  )
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isDraw = homeGoals !== '' && awayGoals !== '' && homeGoals === awayGoals
  const parsedHomeGoals = homeGoals === '' ? null : Number(homeGoals)
  const parsedAwayGoals = awayGoals === '' ? null : Number(awayGoals)
  const homePredictedWinner = parsedHomeGoals !== null && parsedAwayGoals !== null && (
    parsedHomeGoals > parsedAwayGoals || (parsedHomeGoals === parsedAwayGoals && penWinner === 'home')
  )
  const awayPredictedWinner = parsedHomeGoals !== null && parsedAwayGoals !== null && (
    parsedAwayGoals > parsedHomeGoals || (parsedHomeGoals === parsedAwayGoals && penWinner === 'away')
  )

  const doSave = useCallback(async (h: string, a: string, pen: 'home' | 'away' | null) => {
    if (h === '' || a === '') return
    setStatus('saving')
    try {
      const fd = new FormData()
      fd.append('match_id', match.id)
      fd.append('group_id', groupId)
      fd.append('home_goals', h)
      fd.append('away_goals', a)
      if (pen) fd.append('penalty_winner', pen)
      await savePrediction(fd)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 2000)
  }, [match.id, groupId])

  // Auto-save al cambiar score
  useEffect(() => {
    if (closed || !hasTeams || homeGoals === '' || awayGoals === '') return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSave(homeGoals, awayGoals, penWinner), 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [homeGoals, awayGoals, closed, hasTeams, doSave, penWinner])

  // Auto-save inmediato al cambiar penales
  useEffect(() => {
    if (closed || !isDraw || !hasTeams || penWinner === null) return
    doSave(homeGoals, awayGoals, penWinner)
  }, [penWinner]) // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass = "w-10 h-10 text-center bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white font-bold focus:outline-none focus:border-[#C8102E] text-sm"
  const updateHomeGoals = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '')
    setHomeGoals(clean)
    onPredictionChange?.(match.id, clean === '' ? null : Number(clean), awayGoals === '' ? null : Number(awayGoals), penWinner)
  }
  const updateAwayGoals = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '')
    setAwayGoals(clean)
    onPredictionChange?.(match.id, homeGoals === '' ? null : Number(homeGoals), clean === '' ? null : Number(clean), penWinner)
  }
  const updatePenaltyWinner = (value: 'home' | 'away' | null) => {
    setPenWinner(value)
    onPredictionChange?.(match.id, homeGoals === '' ? null : Number(homeGoals), awayGoals === '' ? null : Number(awayGoals), value)
  }

  return (
    <div className={`bg-[#1A1A2E] rounded-xl border transition-colors ${
      closed ? 'border-[#2A2D4A] opacity-80' : 'border-[#2A2D4A] hover:border-[#C8102E]/40'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#8B8FA8] text-xs flex-shrink-0">{formatMatchDate(match.match_date)}</span>
            {(match.city || match.stadium) && (
              <span className="text-[#8B8FA8]/60 text-xs truncate hidden sm:block">
                {[match.city, match.stadium].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!closed && hasTeams && status !== 'idle' && (
              <span className={`text-xs ${
                status === 'saving' ? 'text-[#8B8FA8]' :
                status === 'saved'  ? 'text-[#00A651]' : 'text-[#C8102E]'
              }`}>
                {status === 'saving' ? '⏳' : '✓'}
              </span>
            )}
            {(() => {
              const ds = getDisplayStatus(match.match_date, match.status)
              const isLive = ds === 'live'
              return (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  match.status === 'finished' || ds === 'finished' ? 'bg-[#8B8FA8]/20 text-[#8B8FA8]' :
                  isLive                                            ? 'bg-[#00A651]/20 text-[#00A651]' :
                  closed                                            ? 'bg-[#C8102E]/20 text-[#C8102E]' :
                                                                      'bg-[#003087]/20 text-[#6699ff]'
                }`}>
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] animate-pulse flex-shrink-0" />
                  )}
                  {match.status === 'finished' ? 'Finalizado' :
                   isLive                       ? 'En juego' :
                   closed                       ? 'Cerrado'  : 'Abierto'}
                </span>
              )
            })()}
          </div>
        </div>

        {match.status === 'finished' ? (
          /* ── PARTIDO TERMINADO: resultado real + predicción separados ── */
          <>
            {/* Resultado real */}
            {(() => {
              const rh = match.home_score_full ?? match.home_score ?? null
              const ra = match.away_score_full ?? match.away_score ?? null
              const realHomeWon = rh !== null && ra !== null && rh > ra
              const realAwayWon = rh !== null && ra !== null && ra > rh
              return (
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <span className={`font-medium text-sm ${realHomeWon ? 'font-bold text-white' : 'text-[#8B8FA8]'}`}>
                      {homeTeam?.name ?? '?'}
                    </span>
                    <FlagIcon team={homeTeam} className="flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xl font-black flex-shrink-0">
                    <span className={realHomeWon ? 'text-white' : 'text-[#8B8FA8]'}>{rh ?? '-'}</span>
                    <span className="text-[#8B8FA8] text-sm">-</span>
                    <span className={realAwayWon ? 'text-white' : 'text-[#8B8FA8]'}>{ra ?? '-'}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <FlagIcon team={awayTeam} className="flex-shrink-0" />
                    <span className={`font-medium text-sm ${realAwayWon ? 'font-bold text-white' : 'text-[#8B8FA8]'}`}>
                      {awayTeam?.name ?? '?'}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Predicción del usuario */}
            {prediction && (() => {
              const pts = prediction.points_earned
              const exact = pts >= 5
              const correct = pts >= 3 && !exact
              const wrong = pts === 0
              const predH = prediction.predicted_home_score
              const predA = prediction.predicted_away_score
              const predPen = prediction.predicted_penalty_winner
              return (
                <div className={`mt-1 flex items-center justify-center gap-2 text-xs rounded-lg px-3 py-1.5 ${
                  exact ? 'bg-[#00A651]/15 text-[#00A651]' :
                  correct ? 'bg-[#FFB81C]/15 text-[#FFB81C]' :
                  'bg-[#C8102E]/10 text-[#8B8FA8]'
                }`}>
                  <span className="text-[#8B8FA8]">Tu predicción:</span>
                  <span className="font-bold">{predH}-{predA}</span>
                  {predPen && <span className="text-[10px]">({predPen === 'home' ? homeTeam?.name : awayTeam?.name} pen.)</span>}
                  <span className="font-black ml-1">
                    {exact ? '✓ +' + pts + ' pts' : correct ? '~ +' + pts + ' pts' : '✗ 0 pts'}
                  </span>
                </div>
              )
            })()}

            {/* Penalty real */}
            {knockout && match.went_to_penalties && match.penalty_winner && (
              <div className="mt-1 text-center text-xs text-[#FFB81C]">
                Pen. → {match.penalty_winner === 'home' ? homeTeam?.name : awayTeam?.name}
              </div>
            )}
          </>
        ) : (
          /* ── PARTIDO NO TERMINADO ── */
          <>
            <div className="flex items-center gap-4">
              {/* Home */}
              <div className="flex-1 flex items-center gap-2 justify-end">
                <div className="text-right min-w-0">
                  <div className={`font-medium text-sm leading-tight ${isProjected ? 'text-[#6699ff]' : ''}`}>
                    {homeTeam?.name ?? 'Por definir'}
                  </div>
                  {isProjected && homeTeam && (
                    <div className="text-[10px] text-[#6699ff]/70">proyectado</div>
                  )}
                </div>
                <FlagIcon team={homeTeam} className="flex-shrink-0" />
              </div>

              {/* Score / Input */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!hasTeams ? (
                  <span className="text-[#8B8FA8] text-sm px-2">vs</span>
                ) : closed ? (
                  <div className="flex items-center gap-1 text-lg font-bold text-[#8B8FA8]">
                    <span>{prediction?.predicted_home_score ?? '-'}</span>
                    <span>-</span>
                    <span>{prediction?.predicted_away_score ?? '-'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                      value={homeGoals} onChange={e => updateHomeGoals(e.target.value)}
                      className={inputClass} placeholder="0" />
                    <span className="text-[#8B8FA8]">-</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                      value={awayGoals} onChange={e => updateAwayGoals(e.target.value)}
                      className={inputClass} placeholder="0" />
                  </div>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 flex items-center gap-2">
                <FlagIcon team={awayTeam} className="flex-shrink-0" />
                <div className="min-w-0">
                  <div className={`font-medium text-sm leading-tight ${isProjected ? 'text-[#6699ff]' : ''}`}>
                    {awayTeam?.name ?? 'Por definir'}
                  </div>
                  {isProjected && awayTeam && (
                    <div className="text-[10px] text-[#6699ff]/70">proyectado</div>
                  )}
                </div>
              </div>
            </div>

            {/* Penalty selector — eliminatoria abierta con empate */}
            {knockout && !closed && hasTeams && isDraw && (
              <div className="mt-3 border-t border-[#2A2D4A] pt-3">
                <p className="text-[#8B8FA8] text-xs text-center mb-2">Empate → ¿quién gana en penales?</p>
                <div className="flex gap-2">
                  {[{ side: 'home' as const, team: homeTeam }, { side: 'away' as const, team: awayTeam }].map(({ side, team }) => (
                    <button key={side}
                      onClick={() => updatePenaltyWinner(penWinner === side ? null : side)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                        penWinner === side ? 'bg-[#C8102E] text-white' : 'bg-[#0D0D1A] border border-[#2A2D4A] text-[#8B8FA8] hover:text-white'
                      }`}
                    >
                      <FlagIcon team={team} />
                      <span>{team?.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Penalty predicho (cerrado) */}
            {knockout && closed && prediction?.predicted_penalty_winner && (
              <div className="mt-2 text-center text-xs text-[#8B8FA8]">
                Penales predichos: {prediction.predicted_penalty_winner === 'home' ? homeTeam?.name : awayTeam?.name}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
