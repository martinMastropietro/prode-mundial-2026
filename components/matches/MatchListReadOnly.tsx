'use client'

import { useState } from 'react'
import type { Match, Prediction, Team } from '@/types'
import { PHASE_LABELS } from '@/lib/utils/points'
import { formatMatchDate } from '@/lib/utils/dates'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import FlagIcon from '@/components/ui/FlagIcon'
import GroupStandingsTables from '@/components/standings/GroupStandingsTables'
import type { Standing } from '@/lib/utils/simulate'
import type { MatchProjection } from '@/lib/utils/simulate'

const PHASE_ORDER = ['group','round_of_32','round_of_16','quarterfinal','semifinal','third_place','final']
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

type Props = {
  matches: Match[]
  predictionMap: Map<string, Prediction>
  bracketProjection: Record<number, { home: Team | null; away: Team | null }>
  groupStandings?: Map<string, Standing[]>
}

function PredictionCard({ match, prediction, projHome, projAway }: {
  match: Match
  prediction?: Prediction
  projHome?: Team | null
  projAway?: Team | null
}) {
  const homeTeam = match.home_team ?? projHome ?? null
  const awayTeam = match.away_team ?? projAway ?? null
  const finished = match.status === 'finished'
  const isProjected = !match.home_team && !!projHome
  const homeScore = prediction?.predicted_home_score
  const awayScore = prediction?.predicted_away_score
  const hasPredictionScore = homeScore !== undefined && awayScore !== undefined
  const homePredictedWinner = hasPredictionScore && (
    homeScore > awayScore || (homeScore === awayScore && prediction?.predicted_penalty_winner === 'home')
  )
  const awayPredictedWinner = hasPredictionScore && (
    awayScore > homeScore || (homeScore === awayScore && prediction?.predicted_penalty_winner === 'away')
  )

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2D4A] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#8B8FA8] text-xs">{formatMatchDate(match.match_date)}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          finished ? 'bg-[#8B8FA8]/20 text-[#8B8FA8]' :
          match.status === 'live' ? 'bg-[#00A651]/20 text-[#00A651]' :
          'bg-[#003087]/20 text-[#6699ff]'
        }`}>
          {finished ? 'Finalizado' : match.status === 'live' ? 'En juego' : 'Pendiente'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Local */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className={`font-medium text-sm text-right ${
            homePredictedWinner ? 'text-[#FFB81C] font-black' : isProjected ? 'text-[#6699ff]' : ''
          }`}>
            {homeTeam?.name ?? 'Por definir'}
          </span>
          <FlagIcon team={homeTeam} />
        </div>

        {/* Scores */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {/* Resultado real */}
          {finished && (
            <div className="text-xs text-[#8B8FA8] font-bold">
              {match.home_score_full ?? match.home_score}-{match.away_score_full ?? match.away_score}
            </div>
          )}
          {/* Predicción */}
          {prediction ? (
            <div className={`flex items-center gap-1 font-black text-lg ${
              finished && prediction.points_earned > 0
                ? prediction.points_earned >= 5 ? 'text-[#00A651]' : 'text-[#FFB81C]'
                : finished ? 'text-[#C8102E]' : 'text-white'
            }`}>
              <span>{prediction.predicted_home_score}</span>
              <span className="text-[#8B8FA8] text-sm">-</span>
              <span>{prediction.predicted_away_score}</span>
              {prediction.predicted_penalty_winner && (
                <span className="text-xs ml-0.5">
                  {prediction.predicted_penalty_winner === 'home' ? '↑' : '↓'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#2A2D4A] text-lg font-bold">—</span>
          )}
          {/* Puntos */}
          {finished && prediction && prediction.points_earned > 0 && (
            <div className="text-[10px] text-[#FFB81C] font-bold">+{prediction.points_earned}</div>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex items-center gap-2">
          <FlagIcon team={awayTeam} />
          <span className={`font-medium text-sm ${
            awayPredictedWinner ? 'text-[#FFB81C] font-black' : isProjected ? 'text-[#6699ff]' : ''
          }`}>
            {awayTeam?.name ?? 'Por definir'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MatchListReadOnly({ matches, predictionMap, bracketProjection, groupStandings }: Props) {
  const [selectedPhase, setSelectedPhase] = useState('group')
  const [selectedGroup, setSelectedGroup] = useState('all')

  const phases = PHASE_ORDER.filter(p => matches.some(m => m.phase === p))
  const isGroupPhase = selectedPhase === 'group'
  const availableGroups = isGroupPhase
    ? GROUPS.filter(g => matches.some(m => m.phase === 'group' && m.group_code === g))
    : []

  const filtered = matches.filter(m => {
    if (m.phase !== selectedPhase) return false
    if (isGroupPhase && selectedGroup !== 'all' && m.group_code !== selectedGroup) return false
    return true
  })

  const groupedMatches = isGroupPhase && selectedGroup === 'all'
    ? availableGroups
        .map(g => ({ label: `Grupo ${g}`, items: filtered.filter(m => m.group_code === g) }))
        .filter(g => g.items.length > 0)
    : [{ label: '', items: filtered }]

  return (
    <div>
      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {phases.map(p => (
          <button key={p} onClick={() => { setSelectedPhase(p); setSelectedGroup('all') }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedPhase === p ? 'bg-[#C8102E] text-white' : 'bg-[#1A1A2E] text-[#8B8FA8] border border-[#2A2D4A] hover:text-white'
            }`}
          >
            {PHASE_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      {/* Group filter */}
      {isGroupPhase && availableGroups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedGroup === 'all' ? 'bg-[#003087] text-white' : 'bg-[#1A1A2E] text-[#8B8FA8] border border-[#2A2D4A] hover:text-white'
            }`}
          >Todos</button>
          {availableGroups.map(g => (
            <button key={g} onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors ${
                selectedGroup === g ? 'bg-[#003087] text-white' : 'bg-[#1A1A2E] text-[#8B8FA8] border border-[#2A2D4A] hover:text-white'
              }`}
            >{g}</button>
          ))}
        </div>
      )}

      {/* Bracket for knockout phases */}
      {!isGroupPhase && (
        <div className="mb-6 overflow-x-auto">
          <KnockoutBracket
            matches={matches.filter(m => m.phase !== 'group')}
            projectedMatches={bracketProjection as Record<number, MatchProjection>}
            predictionMap={predictionMap}
          />
        </div>
      )}

      {/* Match list */}
      <div className="space-y-6">
        {groupedMatches.map(({ label, items }) => (
          <div key={label || 'main'}>
            {label && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-black text-[#FFB81C] tracking-widest uppercase">{label}</span>
                <div className="flex-1 h-px bg-[#2A2D4A]" />
              </div>
            )}
            {isGroupPhase && groupStandings && (selectedGroup !== 'all' || items[0]?.group_code) && (
              <div className="mb-3">
                <GroupStandingsTables
                  standings={groupStandings}
                  groupFilter={selectedGroup === 'all' ? items[0]?.group_code : selectedGroup}
                  compact
                />
              </div>
            )}
            <div className="space-y-3">
              {items.map(match => {
                const proj = bracketProjection[match.match_number]
                return (
                  <PredictionCard
                    key={match.id}
                    match={match}
                    prediction={predictionMap.get(match.id)}
                    projHome={proj?.home}
                    projAway={proj?.away}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
