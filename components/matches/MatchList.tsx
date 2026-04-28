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
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function MatchList({ matches, predictionMap, groupId }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<string>('group')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const phases = PHASE_ORDER.filter(p => matches.some(m => m.phase === p))
  const isGroupPhase = selectedPhase === 'group'

  // Grupos disponibles dentro de la fase de grupos
  const availableGroups = isGroupPhase
    ? GROUPS.filter(g => matches.some(m => m.phase === 'group' && m.group_code === g))
    : []

  const filtered = matches.filter(m => {
    if (m.phase !== selectedPhase) return false
    if (isGroupPhase && selectedGroup !== 'all' && m.group_code !== selectedGroup) return false
    return true
  })

  // Agrupar por grupo_code para la fase de grupos
  const groupedMatches: { label: string; items: Match[] }[] = isGroupPhase && selectedGroup === 'all'
    ? availableGroups
        .map(g => ({
          label: `Grupo ${g}`,
          items: filtered.filter(m => m.group_code === g),
        }))
        .filter(g => g.items.length > 0)
    : [{ label: '', items: filtered }]

  return (
    <div>
      {/* Phase filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {phases.map(phase => (
          <button
            key={phase}
            onClick={() => { setSelectedPhase(phase); setSelectedGroup('all') }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedPhase === phase
                ? 'bg-[#C8102E] text-white'
                : 'bg-[#1A1A2E] text-[#8B8FA8] hover:text-white border border-[#2A2D4A]'
            }`}
          >
            {PHASE_LABELS[phase] ?? phase}
          </button>
        ))}
      </div>

      {/* Group filter (solo en fase de grupos) */}
      {isGroupPhase && availableGroups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedGroup === 'all'
                ? 'bg-[#003087] text-white'
                : 'bg-[#1A1A2E] text-[#8B8FA8] hover:text-white border border-[#2A2D4A]'
            }`}
          >
            Todos
          </button>
          {availableGroups.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedGroup === g
                  ? 'bg-[#003087] text-white'
                  : 'bg-[#1A1A2E] text-[#8B8FA8] hover:text-white border border-[#2A2D4A]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Matches grouped */}
      <div className="space-y-6">
        {groupedMatches.length === 0 ? (
          <p className="text-[#8B8FA8] text-sm text-center py-8">
            No hay partidos en esta fase todavía.
          </p>
        ) : (
          groupedMatches.map(({ label, items }) => (
            <div key={label}>
              {label && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black text-[#FFB81C] tracking-widest uppercase">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-[#2A2D4A]" />
                </div>
              )}
              <div className="space-y-3">
                {items.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictionMap.get(match.id)}
                    groupId={groupId}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
