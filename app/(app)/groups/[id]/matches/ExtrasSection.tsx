'use client'

import { useState } from 'react'
import { saveSpecialPrediction } from '../special/actions'
import type { SpecialPrediction } from '@/types'

type GroupOpts = { has_top_scorer: boolean; has_top_assist: boolean; has_mvp: boolean }

type Props = {
  groupId: string
  group: GroupOpts
  existing: Pick<SpecialPrediction, 'top_scorer_name' | 'top_assist_name' | 'mvp_name'> | null
  locked: boolean
}

export default function ExtrasSection({ groupId, group, existing, locked }: Props) {
  const [topScorer, setTopScorer] = useState(existing?.top_scorer_name ?? '')
  const [topAssist, setTopAssist] = useState(existing?.top_assist_name ?? '')
  const [mvp, setMvp]             = useState(existing?.mvp_name ?? '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  async function handleSave() {
    setSaving(true)
    const fd = new FormData()
    fd.append('group_id', groupId)
    fd.append('top_scorer_name', topScorer)
    fd.append('top_assist_name', topAssist)
    fd.append('mvp_name', mvp)
    await saveSpecialPrediction(fd)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = `px-3 py-2 bg-[#0D0D1A] border rounded-xl text-white text-sm focus:outline-none transition-colors ${
    locked ? 'border-[#2A2D4A] opacity-50 cursor-not-allowed' : 'border-[#2A2D4A] focus:border-[#C8102E]'
  }`

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2D4A] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm text-[#FFB81C]">
          🏅 Predicciones especiales
          {locked && <span className="text-[#8B8FA8] font-normal ml-1">(cerradas)</span>}
        </h2>
        {!locked && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
              saved ? 'bg-[#00A651]/20 text-[#00A651]' : 'bg-[#C8102E] hover:bg-[#a50d26] text-white disabled:opacity-50'
            }`}
          >
            {saved ? '✓' : saving ? '...' : 'Guardar'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {group.has_top_scorer && (
          <div>
            <label className="block text-xs text-[#8B8FA8] mb-1">⚽ Máx. goleador</label>
            <input
              type="text" value={topScorer}
              onChange={e => !locked && setTopScorer(e.target.value)}
              disabled={locked} maxLength={50}
              placeholder="Nombre del jugador"
              className={inputClass + ' w-full'}
            />
          </div>
        )}
        {group.has_top_assist && (
          <div>
            <label className="block text-xs text-[#8B8FA8] mb-1">🎯 Máx. asistidor</label>
            <input
              type="text" value={topAssist}
              onChange={e => !locked && setTopAssist(e.target.value)}
              disabled={locked} maxLength={50}
              placeholder="Nombre del jugador"
              className={inputClass + ' w-full'}
            />
          </div>
        )}
        {group.has_mvp && (
          <div>
            <label className="block text-xs text-[#8B8FA8] mb-1">⭐ MVP</label>
            <input
              type="text" value={mvp}
              onChange={e => !locked && setMvp(e.target.value)}
              disabled={locked} maxLength={50}
              placeholder="Nombre del jugador"
              className={inputClass + ' w-full'}
            />
          </div>
        )}
      </div>
    </div>
  )
}
