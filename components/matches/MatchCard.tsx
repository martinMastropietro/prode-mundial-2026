'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { isMatchClosed, formatMatchDate } from '@/lib/utils/dates'
import { savePrediction } from '@/app/(app)/groups/[id]/matches/actions'
import type { Match, Prediction, Team } from '@/types'

type Props = {
  match: Match
  prediction?: Prediction
  groupId: string
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

export default function MatchCard({ match, prediction, groupId, projectedHome, projectedAway, onPredictionChange }: Props) {
  const closed = isMatchClosed(match.match_date, match.status)
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

  const doSave = useCallback(async (h: string, a: string, pen: 'home' | 'away' | null) => {
    if (h === '' || a === '') return
    setStatus('saving')
    const fd = new FormData()
    fd.append('match_id', match.id)
    fd.append('group_id', groupId)
    fd.append('home_goals', h)
    fd.append('away_goals', a)
    if (pen) fd.append('penalty_winner', pen)
    await savePrediction(fd)
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 1500)
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
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#8B8FA8] text-xs">{formatMatchDate(match.match_date)}</span>
          <div className="flex items-center gap-2">
            {!closed && hasTeams && status !== 'idle' && (
              <span className={`text-xs ${
                status === 'saving' ? 'text-[#8B8FA8]' :
                status === 'saved'  ? 'text-[#00A651]' : 'text-[#C8102E]'
              }`}>
                {status === 'saving' ? '⏳' : '✓'}
              </span>
            )}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              match.status === 'finished' ? 'bg-[#8B8FA8]/20 text-[#8B8FA8]' :
              match.status === 'live'     ? 'bg-[#00A651]/20 text-[#00A651]' :
              closed                      ? 'bg-[#C8102E]/20 text-[#C8102E]' :
                                            'bg-[#003087]/20 text-[#6699ff]'
            }`}>
              {match.status === 'finished' ? 'Finalizado' :
               match.status === 'live'     ? 'En juego' :
               closed                      ? 'Cerrado'   : 'Abierto'}
            </span>
          </div>
        </div>

        {/* Teams row */}
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
            <span className="text-2xl flex-shrink-0">{homeTeam?.flag_emoji ?? '🏳️'}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {match.status === 'finished' ? (
              <div className="flex items-center gap-1 text-xl font-black">
                <span>{match.home_score_full ?? match.home_score ?? '-'}</span>
                <span className="text-[#8B8FA8]">-</span>
                <span>{match.away_score_full ?? match.away_score ?? '-'}</span>
              </div>
            ) : !hasTeams ? (
              <span className="text-[#8B8FA8] text-sm px-2">vs</span>
            ) : closed ? (
              <div className="flex items-center gap-1 text-lg font-bold text-[#8B8FA8]">
                <span>{prediction?.predicted_home_score ?? '-'}</span>
                <span>-</span>
                <span>{prediction?.predicted_away_score ?? '-'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                  value={homeGoals}
                  onChange={e => updateHomeGoals(e.target.value)}
                  className={inputClass} placeholder="0"
                />
                <span className="text-[#8B8FA8]">-</span>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                  value={awayGoals}
                  onChange={e => updateAwayGoals(e.target.value)}
                  className={inputClass} placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-2xl flex-shrink-0">{awayTeam?.flag_emoji ?? '🏳️'}</span>
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

        {/* Penalty selector — solo en empate de eliminatoria */}
        {knockout && !closed && hasTeams && isDraw && (
          <div className="mt-3 border-t border-[#2A2D4A] pt-3">
            <p className="text-[#8B8FA8] text-xs text-center mb-2">
              Empate → ¿quién gana en penales?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updatePenaltyWinner(penWinner === 'home' ? null : 'home')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                  penWinner === 'home'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-[#0D0D1A] border border-[#2A2D4A] text-[#8B8FA8] hover:text-white'
                }`}
              >
                <span>{homeTeam?.flag_emoji}</span>
                <span>{homeTeam?.name}</span>
              </button>
              <button
                onClick={() => updatePenaltyWinner(penWinner === 'away' ? null : 'away')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                  penWinner === 'away'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-[#0D0D1A] border border-[#2A2D4A] text-[#8B8FA8] hover:text-white'
                }`}
              >
                <span>{awayTeam?.flag_emoji}</span>
                <span>{awayTeam?.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* Penalty result (cerrado o terminado) */}
        {knockout && (match.went_to_penalties || (closed && prediction?.predicted_penalty_winner)) && (
          <div className="mt-2 text-center text-xs text-[#FFB81C]">
            {match.went_to_penalties
              ? `Pen: ${match.penalty_winner === 'home' ? homeTeam?.name : awayTeam?.name} ✓`
              : `Tu predicción penales: ${prediction?.predicted_penalty_winner === 'home' ? homeTeam?.name : awayTeam?.name}`}
          </div>
        )}

        {/* Points */}
        {match.status === 'finished' && prediction && prediction.points_earned > 0 && (
          <div className="mt-2 text-center">
            <span className="text-[#FFB81C] text-sm font-bold">+{prediction.points_earned} pts</span>
          </div>
        )}
      </div>
    </div>
  )
}
