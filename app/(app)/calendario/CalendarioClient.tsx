'use client'

import { useState } from 'react'
import GroupStageView from '@/components/calendario/GroupStageView'
import KnockoutBracket from '@/components/calendario/KnockoutBracket'
import type { Match } from '@/types'

const TABS = [
  { id: 'grupos', label: 'Fase de grupos' },
  { id: 'eliminatorias', label: 'Cuadro eliminatorio' },
]

export default function CalendarioClient({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState('grupos')

  const groupMatches = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')

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
      {tab === 'eliminatorias' && <KnockoutBracket matches={knockoutMatches} />}
    </div>
  )
}
