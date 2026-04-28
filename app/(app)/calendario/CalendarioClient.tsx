'use client'

import { useState, useMemo } from 'react'
import GroupStageView from '@/components/calendario/GroupStageView'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import type { Match, Prediction, Team } from '@/types'
import { simulateGroupStandings, buildProjectedQualifiers } from '@/lib/utils/simulate'

const TABS = [
  { id: 'grupos', label: 'Fase de grupos' },
  { id: 'eliminatorias', label: 'Cuadro eliminatorio' },
]

type Props = {
  matches: Match[]
  teams: Team[]
  userPredictions: Record<string, Prediction>
}

export default function CalendarioClient({ matches, teams, userPredictions }: Props) {
  const [tab, setTab] = useState('grupos')

  const predMap = useMemo(
    () => new Map(Object.entries(userPredictions)),
    [userPredictions]
  )

  const groupMatches    = useMemo(() => matches.filter(m => m.phase === 'group'), [matches])
  const knockoutMatches = useMemo(() => matches.filter(m => m.phase !== 'group'), [matches])

  const projectedQualifiers = useMemo(() => {
    const standings = simulateGroupStandings(matches, predMap, teams)
    return buildProjectedQualifiers(standings)
  }, [matches, predMap, teams])

  const hasPredictions = predMap.size > 0

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#2A2D4A]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              tab === t.id
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C8102E]'
                : 'text-[#8B8FA8] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'grupos' && <GroupStageView matches={groupMatches} />}
      {tab === 'eliminatorias' && (
        <>
          {hasPredictions && (
            <div className="mb-4 px-3 py-2 bg-[#003087]/20 border border-[#003087]/30 rounded-xl text-xs text-[#6699ff]">
              ⚡ Proyección basada en tus predicciones — los equipos se actualizan automáticamente
            </div>
          )}
          <KnockoutBracket
            matches={knockoutMatches}
            projectedQualifiers={projectedQualifiers}
          />
        </>
      )}
    </div>
  )
}
