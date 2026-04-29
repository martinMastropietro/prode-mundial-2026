'use client'

import { useState } from 'react'
import GroupStageView from '@/components/calendario/GroupStageView'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import GroupStandingsTables from '@/components/standings/GroupStandingsTables'
import type { Match, Team } from '@/types'
import type { Standing, MatchProjection } from '@/lib/utils/simulate'

const TABS = [
  { id: 'partidos',      label: 'Partidos' },
  { id: 'grupos',        label: 'Fase de grupos' },
  { id: 'eliminatorias', label: 'Cuadro' },
]

type Props = {
  matches: Match[]
  teams?: Team[]
  realQualifiers?: Record<string, Team>
  realBracket?: Record<number, MatchProjection>
  realStandings?: Record<string, Standing[] | undefined>
}

export default function CalendarioClient({ matches, realQualifiers, realBracket, realStandings }: Props) {
  const [tab, setTab] = useState('partidos')

  const groupMatches    = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')

  // Convertir standings serializado de vuelta a Map
  const standingsMap = new Map<string, Standing[]>()
  if (realStandings) {
    for (const [g, rows] of Object.entries(realStandings)) {
      if (rows) standingsMap.set(g, rows)
    }
  }

  // Convertir qualifiers serializado a Map
  const qualifiersMap = new Map<string, Team>(
    Object.entries(realQualifiers ?? {})
  )

  const anyResultsLoaded = matches.some(m => m.status === 'finished')

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
          standings={standingsMap}
        />
      )}

      {tab === 'eliminatorias' && (
        <div>
          <div className="mb-3 px-3 py-2 bg-[#003087]/20 border border-[#003087]/30 rounded-xl text-xs text-[#6699ff]">
            {anyResultsLoaded
              ? '⚡ Proyección basada en resultados reales — se actualiza con cada partido'
              : '📅 Los clasificados aparecerán a medida que avance la fase de grupos'}
          </div>
          <KnockoutBracket
            matches={knockoutMatches}
            projectedQualifiers={qualifiersMap}
            projectedMatches={realBracket}
            showPredictionLegend={false}
          />
        </div>
      )}
    </div>
  )
}
