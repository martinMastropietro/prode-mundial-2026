'use client'

import { useState } from 'react'
import { saveMatchResult } from './actions'
import type { Match } from '@/types'
import { PHASE_LABELS } from '@/lib/utils/points'

const PHASE_ORDER = ['group','round_of_32','round_of_16','quarterfinal','semifinal','third_place','final']

function MatchResultRow({ match }: { match: Match }) {
  const [homeScore, setHomeScore] = useState(match.home_score_full?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(match.away_score_full?.toString() ?? '')
  const [et, setEt] = useState(match.went_to_extra_time)
  const [pens, setPens] = useState(match.went_to_penalties)
  const [penWinner, setPenWinner] = useState<'home' | 'away' | ''>(match.penalty_winner ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const finished = match.status === 'finished'
  const isDraw = homeScore !== '' && awayScore !== '' && homeScore === awayScore
  const isKnockout = match.phase !== 'group'

  async function handleSave() {
    if (homeScore === '' || awayScore === '') return
    setSaving(true)
    const fd = new FormData()
    fd.append('match_id', match.id)
    fd.append('home_score', homeScore)
    fd.append('away_score', awayScore)
    if (et) fd.append('went_to_extra_time', '1')
    if (pens) fd.append('went_to_penalties', '1')
    if (pens && penWinner) fd.append('penalty_winner', penWinner)
    await saveMatchResult(fd)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 border-b border-[#2A2D4A]/50 last:border-0">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Partido */}
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <span className="text-lg">{match.home_team?.flag_emoji ?? '🏳️'}</span>
          <span className="text-sm font-medium">{match.home_team?.name ?? 'TBD'}</span>
          <span className="text-[#8B8FA8] text-xs">vs</span>
          <span className="text-sm font-medium">{match.away_team?.name ?? 'TBD'}</span>
          <span className="text-lg">{match.away_team?.flag_emoji ?? '🏳️'}</span>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2">
          <input
            type="text" inputMode="numeric" maxLength={2}
            value={homeScore}
            onChange={e => setHomeScore(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-10 h-9 text-center bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white font-bold text-sm focus:outline-none focus:border-[#C8102E]"
            placeholder="0"
          />
          <span className="text-[#8B8FA8]">-</span>
          <input
            type="text" inputMode="numeric" maxLength={2}
            value={awayScore}
            onChange={e => setAwayScore(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-10 h-9 text-center bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white font-bold text-sm focus:outline-none focus:border-[#C8102E]"
            placeholder="0"
          />
        </div>

        {/* Opciones eliminatoria */}
        {isKnockout && (
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={et} onChange={e => setEt(e.target.checked)} className="accent-[#C8102E]" />
              <span className="text-[#8B8FA8]">Prórroga</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={pens} onChange={e => setPens(e.target.checked)} className="accent-[#C8102E]" />
              <span className="text-[#8B8FA8]">Penales</span>
            </label>
            {pens && isDraw && (
              <select
                value={penWinner}
                onChange={e => setPenWinner(e.target.value as 'home' | 'away')}
                className="bg-[#0D0D1A] border border-[#2A2D4A] rounded-lg text-white text-xs px-2 py-1 focus:outline-none"
              >
                <option value="">¿Quién gana?</option>
                <option value="home">{match.home_team?.name ?? 'Local'}</option>
                <option value="away">{match.away_team?.name ?? 'Visitante'}</option>
              </select>
            )}
          </div>
        )}

        {/* Estado / Botón */}
        <button
          onClick={handleSave}
          disabled={saving || homeScore === '' || awayScore === ''}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            saved
              ? 'bg-[#00A651]/20 text-[#00A651]'
              : 'bg-[#C8102E] hover:bg-[#a50d26] text-white disabled:opacity-40'
          }`}
        >
          {saved ? '✓ Guardado' : saving ? '...' : finished ? 'Actualizar resultado' : 'Marcar terminado'}
        </button>
      </div>

      {/* Info del partido terminado */}
      {finished && (
        <div className="mt-1 text-xs text-[#8B8FA8]">
          {match.home_score_full}-{match.away_score_full}
          {match.went_to_extra_time && ' (prórroga)'}
          {match.went_to_penalties && ` · Penales: ${match.penalty_winner === 'home' ? match.home_team?.name : match.away_team?.name}`}
        </div>
      )}
    </div>
  )
}

export default function AdminMatchList({ matches }: { matches: Match[] }) {
  const [selectedPhase, setSelectedPhase] = useState('group')
  const phases = PHASE_ORDER.filter(p => matches.some(m => m.phase === p))
  const filtered = matches.filter(m => m.phase === selectedPhase && (m.home_team_id || m.phase === 'group'))

  const pending = filtered.filter(m => m.status !== 'finished').length
  const done = filtered.filter(m => m.status === 'finished').length

  return (
    <div>
      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {phases.map(p => (
          <button key={p} onClick={() => setSelectedPhase(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedPhase === p ? 'bg-[#C8102E] text-white' : 'bg-[#1A1A2E] text-[#8B8FA8] border border-[#2A2D4A] hover:text-white'
            }`}
          >
            {PHASE_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-[#8B8FA8]">Pendientes: <strong className="text-white">{pending}</strong></span>
        <span className="text-[#8B8FA8]">Cargados: <strong className="text-[#00A651]">{done}</strong></span>
      </div>

      <div className="bg-[#1A1A2E] rounded-2xl border border-[#2A2D4A] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-[#8B8FA8] text-sm py-8">No hay partidos con equipos asignados en esta fase.</p>
        ) : (
          filtered.map(m => <MatchResultRow key={m.id} match={m} />)
        )}
      </div>
    </div>
  )
}
