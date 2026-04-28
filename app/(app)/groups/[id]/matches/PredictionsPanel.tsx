'use client'

import { useMemo, useState } from 'react'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import MatchList from '@/components/matches/MatchList'
import GroupStandingsTables from '@/components/standings/GroupStandingsTables'
import type { Match, Prediction, Team } from '@/types'
import {
  simulateGroupStandings,
  buildProjectedQualifiers,
  buildFullBracketProjection,
} from '@/lib/utils/simulate'

type Props = {
  matches: Match[]
  teams: Team[]
  groupId: string
  initialPredictions: Record<string, Prediction>
}

export default function PredictionsPanel({ matches, teams, groupId, initialPredictions }: Props) {
  const [predictionMap, setPredictionMap] = useState(
    () => new Map<string, Prediction>(Object.entries(initialPredictions))
  )

  const standings = useMemo(
    () => simulateGroupStandings(matches, predictionMap, teams),
    [matches, predictionMap, teams]
  )

  const qualifiers = useMemo(
    () => buildProjectedQualifiers(standings),
    [standings]
  )

  const bracketProjectionObj = useMemo(() => {
    const projection = buildFullBracketProjection(qualifiers, matches, predictionMap)
    const obj: Record<number, { home: Team | null; away: Team | null }> = {}
    for (const [k, v] of projection) obj[k] = v
    return obj
  }, [qualifiers, matches, predictionMap])

  const updatePrediction = (
    matchId: string,
    homeGoals: number | null,
    awayGoals: number | null,
    penaltyWinner: 'home' | 'away' | null
  ) => {
    setPredictionMap(prev => {
      const next = new Map(prev)
      if (homeGoals === null || awayGoals === null) {
        next.delete(matchId)
        return next
      }

      const existing = next.get(matchId)
      next.set(matchId, {
        id: existing?.id ?? `draft-${matchId}`,
        user_id: existing?.user_id ?? '',
        group_id: existing?.group_id ?? groupId,
        match_id: matchId,
        predicted_home_score: homeGoals,
        predicted_away_score: awayGoals,
        predicted_penalty_winner: homeGoals === awayGoals ? penaltyWinner : null,
        points_earned: existing?.points_earned ?? 0,
        calculated_at: existing?.calculated_at ?? null,
        created_at: existing?.created_at ?? '',
        updated_at: new Date().toISOString(),
      })
      return next
    })
  }

  return (
    <>
      <div className="mb-8">
        <GroupStandingsTables
          title="Tabla proyectada"
          standings={standings}
          compact
        />
      </div>

      <section className="mb-8">
        <div className="mb-3 px-3 py-2 bg-[#003087]/20 border border-[#003087]/30 rounded-xl text-xs text-[#6699ff]">
          ⚡ Cuadro proyectado desde tus predicciones — se actualiza automáticamente
        </div>
        <KnockoutBracket
          matches={matches.filter(m => m.phase !== 'group')}
          projectedQualifiers={qualifiers}
          projectedMatches={bracketProjectionObj}
        />
      </section>

      <MatchList
        matches={matches}
        predictionMap={predictionMap}
        groupId={groupId}
        bracketProjection={bracketProjectionObj}
        onPredictionChange={updatePrediction}
      />
    </>
  )
}
