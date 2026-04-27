'use client'

import { useState } from 'react'
import { saveSpecialPrediction } from './actions'
import type { Team, SpecialPrediction } from '@/types'

type Props = {
  teams: Team[]
  existing: SpecialPrediction | null
  locked: boolean
  groupId: string
}

export default function SpecialPredictionForm({ teams, existing, locked, groupId }: Props) {
  const [champion, setChampion] = useState(existing?.champion_team_id ?? '')
  const [runnerUp, setRunnerUp] = useState(existing?.runner_up_team_id ?? '')
  const [thirdPlace, setThirdPlace] = useState(existing?.third_place_team_id ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!champion || !runnerUp || !thirdPlace) return
    setSaving(true)
    const fd = new FormData()
    fd.append('group_id', groupId)
    fd.append('champion_team_id', champion)
    fd.append('runner_up_team_id', runnerUp)
    fd.append('third_place_team_id', thirdPlace)
    await saveSpecialPrediction(fd)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const teamOptions = teams.map((t) => ({
    value: t.id,
    label: `${t.flag_emoji ?? ''} ${t.name}`,
  }))

  const selectClass = `w-full px-4 py-3 bg-[#0D0D1A] border rounded-xl text-white focus:outline-none transition-colors ${
    locked ? 'border-[#2A2D4A] opacity-60 cursor-not-allowed' : 'border-[#2A2D4A] focus:border-[#C8102E]'
  }`

  return (
    <div className="space-y-5">
      {[
        { label: '🥇 Campeón', value: champion, setter: setChampion, color: '#FFB81C', exclude: [runnerUp, thirdPlace] },
        { label: '🥈 Subcampeón', value: runnerUp, setter: setRunnerUp, color: '#C0C0C0', exclude: [champion, thirdPlace] },
        { label: '🥉 Tercer puesto', value: thirdPlace, setter: setThirdPlace, color: '#CD7F32', exclude: [champion, runnerUp] },
      ].map((item) => (
        <div key={item.label}>
          <label className="block text-sm font-bold mb-2" style={{ color: item.color }}>
            {item.label}
          </label>
          <select
            value={item.value}
            onChange={(e) => !locked && item.setter(e.target.value)}
            disabled={locked}
            className={selectClass}
          >
            <option value="">Elegí un equipo...</option>
            {teamOptions
              .filter((t) => !item.exclude.includes(t.value) || t.value === item.value)
              .map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
          </select>
        </div>
      ))}

      {!locked && (
        <button
          onClick={handleSave}
          disabled={saving || !champion || !runnerUp || !thirdPlace}
          className={`w-full py-3 font-bold rounded-xl transition-colors ${
            saved
              ? 'bg-[#00A651]/20 text-[#00A651]'
              : 'bg-[#C8102E] hover:bg-[#a50d26] text-white disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : existing ? 'Actualizar predicción' : 'Guardar predicción'}
        </button>
      )}

      {locked && existing && (
        <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A] text-center">
          <p className="text-[#8B8FA8] text-sm">Predicción guardada y bloqueada</p>
          {existing.champion_points + existing.runner_up_points + existing.third_place_points > 0 && (
            <p className="text-[#FFB81C] font-bold mt-1">
              +{existing.champion_points + existing.runner_up_points + existing.third_place_points} pts ganados
            </p>
          )}
        </div>
      )}
    </div>
  )
}
