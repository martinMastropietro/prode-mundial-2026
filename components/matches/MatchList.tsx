'use client'

import { useState } from 'react'
import MatchCard from './MatchCard'
import type { Match, Prediction } from '@/types'
import { PHASE_LABELS } from '@/lib/utils/points'

type Props = {
  matches: Match[]
  predictionMap: Map<string, Prediction>
  groupId: string
}

const PHASE_ORDER = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

export default function MatchList({ matches, predictionMap, groupId }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<string>('group')

  const phases = PHASE_ORDER.filter((p) => matches.some((m) => m.phase === p))
  const filtered = matches.filter((m) => m.phase === selectedPhase)

  return (
    <div>
      {/* Phase filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedPhase === phase
                ? 'bg-[#C8102E] text-white'
                : 'bg-[#1A1A2E] text-[#8B8FA8] hover:text-white border border-[#2A2D4A]'
            }`}
          >
            {PHASE_LABELS[phase] ?? phase}
          </button>
        ))}
      </div>

      {/* Matches */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-[#8B8FA8] text-sm text-center py-8">
            No hay partidos en esta fase todavía.
          </p>
        ) : (
          filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionMap.get(match.id)}
              groupId={groupId}
            />
          ))
        )}
      </div>
    </div>
  )
}
