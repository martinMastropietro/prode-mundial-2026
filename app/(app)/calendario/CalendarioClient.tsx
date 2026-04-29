'use client'

import { useState, useMemo } from 'react'
import GroupStageView from '@/components/calendario/GroupStageView'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import GroupStandingsTables from '@/components/standings/GroupStandingsTables'
import type { Match, Prediction, Team } from '@/types'
import { simulateGroupStandings } from '@/lib/utils/simulate'

const TABS = [
  { id: 'partidos', label: 'Partidos' },
  { id: 'grupos', label: 'Fase de grupos' },
  { id: 'eliminatorias', label: 'Cuadro' },
]

type Props = {
  matches: Match[]
  teams: Team[]
}

export default function CalendarioClient({ matches, teams }: Props) {
  const [tab, setTab] = useState('partidos')

  const groupMatches    = useMemo(() => matches.filter(m => m.phase === 'group'), [matches])
  const knockoutMatches = useMemo(() => matches.filter(m => m.phase !== 'group'), [matches])
  const officialStandings = useMemo(
    () => simulateGroupStandings(matches, new Map<string, Prediction>(), teams),
    [matches, teams]
  )

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

      {tab === 'partidos' && <GroupStageView matches={groupMatches} />}
      {tab === 'grupos' && (
        <GroupStandingsTables
          title="Posiciones por grupo"
          standings={officialStandings}
        />
      )}
      {tab === 'eliminatorias' && (
        <KnockoutBracket matches={knockoutMatches} />
      )}
    </div>
  )
}
