'use client'

import { useState } from 'react'
import { saveSpecialPrediction } from './actions'
import type { Team, SpecialPrediction } from '@/types'

type GroupOpts = { has_top_scorer: boolean; has_top_assist: boolean; has_mvp: boolean }
type OtherPrediction = SpecialPrediction & { group: { name: string; public_id: string } | null }

type Props = {
  teams?: Team[]
  existing: SpecialPrediction | null
  locked: boolean
  groupId: string
  group: GroupOpts
  otherPredictions: OtherPrediction[]
}

export default function SpecialPredictionForm({
  teams, existing, locked, groupId, group, otherPredictions
}: Props) {
  const [champion, setChampion]     = useState(existing?.champion_team_id ?? '')
  const [runnerUp, setRunnerUp]     = useState(existing?.runner_up_team_id ?? '')
  const [thirdPlace, setThirdPlace] = useState(existing?.third_place_team_id ?? '')
  const [topScorer, setTopScorer]   = useState(existing?.top_scorer_name ?? '')
  const [topAssist, setTopAssist]   = useState(existing?.top_assist_name ?? '')
  const [mvp, setMvp]               = useState(existing?.mvp_name ?? '')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  async function handleSave() {
    setSaving(true)
    const fd = new FormData()
    fd.append('group_id', groupId)
    fd.append('champion_team_id', champion)
    fd.append('runner_up_team_id', runnerUp)
    fd.append('third_place_team_id', thirdPlace)
    fd.append('top_scorer_name', topScorer)
    fd.append('top_assist_name', topAssist)
    fd.append('mvp_name', mvp)
    await saveSpecialPrediction(fd)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function importFrom(pred: OtherPrediction) {
    if (pred.champion_team_id) setChampion(pred.champion_team_id)
    if (pred.runner_up_team_id) setRunnerUp(pred.runner_up_team_id)
    if (pred.third_place_team_id) setThirdPlace(pred.third_place_team_id)
    if (pred.top_scorer_name && group.has_top_scorer) setTopScorer(pred.top_scorer_name)
    if (pred.top_assist_name && group.has_top_assist) setTopAssist(pred.top_assist_name)
    if (pred.mvp_name && group.has_mvp) setMvp(pred.mvp_name)
  }

  const selectClass = `w-full px-4 py-3 bg-[#0D0D1A] border rounded-xl text-white focus:outline-none transition-colors ${
    locked ? 'border-[#2A2D4A] opacity-60 cursor-not-allowed' : 'border-[#2A2D4A] focus:border-[#C8102E]'
  }`

  const teamOptions = teams.map(t => ({ value: t.id, label: `${t.flag_emoji ?? ''} ${t.name}` }))

  return (
    <div className="space-y-5">
      {/* Import from another group */}
      {!locked && otherPredictions.length > 0 && (
        <div className="bg-[#16213E] rounded-xl p-4 border border-[#2A2D4A]">
          <p className="text-sm font-medium mb-3 text-[#8B8FA8]">Importar predicción de otro grupo</p>
          <div className="flex flex-wrap gap-2">
            {otherPredictions.map(pred => (
              <button
                key={pred.id}
                type="button"
                onClick={() => importFrom(pred)}
                className="px-3 py-1.5 bg-[#003087] hover:bg-[#00246b] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Desde {pred.group?.name ?? pred.group?.public_id ?? 'otro grupo'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selects de equipo */}
      {[
        { label: '🥇 Campeón', color: '#FFD700', value: champion, setter: setChampion, exclude: [runnerUp, thirdPlace] },
        { label: '🥈 Subcampeón', color: '#C0C0C0', value: runnerUp, setter: setRunnerUp, exclude: [champion, thirdPlace] },
        { label: '🥉 Tercer puesto', color: '#CD7F32', value: thirdPlace, setter: setThirdPlace, exclude: [champion, runnerUp] },
      ].map(item => (
        <div key={item.label}>
          <label className="block text-sm font-bold mb-2" style={{ color: item.color }}>
            {item.label}
          </label>
          <select
            value={item.value}
            onChange={e => !locked && item.setter(e.target.value)}
            disabled={locked}
            className={selectClass}
          >
            <option value="">Elegí un equipo...</option>
            {teamOptions
              .filter(t => !item.exclude.includes(t.value) || t.value === item.value)
              .map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      ))}

      {/* Campos de texto: goleador, asistidor, MVP */}
      {group.has_top_scorer && (
        <div>
          <label className="block text-sm font-bold mb-2 text-[#FFB81C]">⚽ Máximo goleador</label>
          <input
            type="text"
            value={topScorer}
            onChange={e => !locked && setTopScorer(e.target.value)}
            disabled={locked}
            maxLength={50}
            placeholder="Nombre del jugador"
            className={selectClass}
          />
        </div>
      )}
      {group.has_top_assist && (
        <div>
          <label className="block text-sm font-bold mb-2 text-[#FFB81C]">🎯 Máximo asistidor</label>
          <input
            type="text"
            value={topAssist}
            onChange={e => !locked && setTopAssist(e.target.value)}
            disabled={locked}
            maxLength={50}
            placeholder="Nombre del jugador"
            className={selectClass}
          />
        </div>
      )}
      {group.has_mvp && (
        <div>
          <label className="block text-sm font-bold mb-2 text-[#FFB81C]">⭐ MVP del torneo</label>
          <input
            type="text"
            value={mvp}
            onChange={e => !locked && setMvp(e.target.value)}
            disabled={locked}
            maxLength={50}
            placeholder="Nombre del jugador"
            className={selectClass}
          />
        </div>
      )}

      {!locked ? (
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
      ) : (
        <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A] text-center">
          <p className="text-[#8B8FA8] text-sm">Predicción cerrada</p>
          {existing && (existing.champion_points + existing.runner_up_points + existing.third_place_points +
            existing.top_scorer_points + existing.top_assist_points + existing.mvp_points) > 0 && (
            <p className="text-[#FFB81C] font-bold mt-1">
              +{existing.champion_points + existing.runner_up_points + existing.third_place_points +
                existing.top_scorer_points + existing.top_assist_points + existing.mvp_points} pts ganados
            </p>
          )}
        </div>
      )}
    </div>
  )
}
