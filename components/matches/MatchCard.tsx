'use client'

import { useState } from 'react'
import { isMatchClosed, formatMatchDate } from '@/lib/utils/dates'
import { savePrediction } from '@/app/(app)/groups/[id]/matches/actions'
import type { Match, Prediction } from '@/types'

type Props = {
  match: Match
  prediction?: Prediction
  groupId: string
}

export default function MatchCard({ match, prediction, groupId }: Props) {
  const closed = isMatchClosed(match.match_date, match.status)
  const [homeGoals, setHomeGoals] = useState(prediction?.predicted_home_score?.toString() ?? '')
  const [awayGoals, setAwayGoals] = useState(prediction?.predicted_away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const homeTeam = match.home_team
  const awayTeam = match.away_team

  async function handleSave() {
    if (!homeGoals || !awayGoals) return
    setSaving(true)
    const fd = new FormData()
    fd.append('match_id', match.id)
    fd.append('group_id', groupId)
    fd.append('home_goals', homeGoals)
    fd.append('away_goals', awayGoals)
    await savePrediction(fd)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`bg-[#1A1A2E] rounded-xl border transition-colors ${
      closed ? 'border-[#2A2D4A] opacity-80' : 'border-[#2A2D4A] hover:border-[#C8102E]/40'
    }`}>
      <div className="p-4">
        {/* Date / Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#8B8FA8] text-xs">{formatMatchDate(match.match_date)}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            match.status === 'finished'
              ? 'bg-[#8B8FA8]/20 text-[#8B8FA8]'
              : match.status === 'live'
              ? 'bg-[#00A651]/20 text-[#00A651]'
              : closed
              ? 'bg-[#C8102E]/20 text-[#C8102E]'
              : 'bg-[#003087]/20 text-[#003087]'
          }`}>
            {match.status === 'finished' ? 'Finalizado' : match.status === 'live' ? 'En juego' : closed ? 'Cerrado' : 'Abierto'}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-4">
          {/* Home */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="font-medium text-sm text-right">{homeTeam?.name ?? 'Por definir'}</span>
            <span className="text-2xl">{homeTeam?.flag_emoji ?? '🏳️'}</span>
          </div>

          {/* Score / Input */}
          <div className="flex items-center gap-2">
            {match.status === 'finished' ? (
              <div className="flex items-center gap-1 text-xl font-black">
                <span>{match.home_score_full ?? match.home_score ?? '-'}</span>
                <span className="text-[#8B8FA8]">-</span>
                <span>{match.away_score_full ?? match.away_score ?? '-'}</span>
              </div>
            ) : closed ? (
              <div className="flex items-center gap-1 text-lg font-bold text-[#8B8FA8]">
                <span>{prediction?.predicted_home_score ?? '-'}</span>
                <span>-</span>
                <span>{prediction?.predicted_away_score ?? '-'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={homeGoals}
                  onChange={(e) => setHomeGoals(e.target.value)}
                  className="w-10 h-10 text-center bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white font-bold focus:outline-none focus:border-[#C8102E] text-sm"
                />
                <span className="text-[#8B8FA8]">-</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={awayGoals}
                  onChange={(e) => setAwayGoals(e.target.value)}
                  className="w-10 h-10 text-center bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white font-bold focus:outline-none focus:border-[#C8102E] text-sm"
                />
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-2xl">{awayTeam?.flag_emoji ?? '🏳️'}</span>
            <span className="font-medium text-sm">{awayTeam?.name ?? 'Por definir'}</span>
          </div>
        </div>

        {/* Points earned */}
        {match.status === 'finished' && prediction && prediction.points_earned > 0 && (
          <div className="mt-2 text-center">
            <span className="text-[#FFB81C] text-sm font-bold">+{prediction.points_earned} pts</span>
          </div>
        )}

        {/* Save button */}
        {!closed && (
          <button
            onClick={handleSave}
            disabled={saving || homeGoals === '' || awayGoals === ''}
            className={`mt-4 w-full py-2 text-sm font-bold rounded-xl transition-colors ${
              saved
                ? 'bg-[#00A651]/20 text-[#00A651]'
                : 'bg-[#C8102E] hover:bg-[#a50d26] text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : prediction ? 'Actualizar' : 'Guardar'}
          </button>
        )}
      </div>
    </div>
  )
}
