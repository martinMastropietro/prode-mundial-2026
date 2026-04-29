'use client'

import { useActionState, useState } from 'react'
import { createGroup } from './actions'
import { PREDICTION_MODE_OPTIONS } from '@/lib/utils/predictionModes'

export default function CreateGroupPage() {
  const [state, action, pending] = useActionState(createGroup, undefined)

  // Controlled inputs — preservan valores si hay error del servidor
  const [publicId, setPublicId] = useState(state?.values?.public_id ?? '')
  const [name, setName] = useState(state?.values?.name ?? '')
  const [password, setPassword] = useState(state?.values?.access_password ?? '')
  const [predictionMode, setPredictionMode] = useState(state?.values?.prediction_mode ?? 'full_bracket')

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-black mb-6">Crear grupo</h1>

      <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
        <form action={action} className="space-y-5">

          {/* ID del grupo */}
          <div>
            <label htmlFor="public_id" className="block text-sm font-medium mb-1">
              ID del grupo
              <span className="text-[#8B8FA8] font-normal ml-1">— con esto te encuentran</span>
            </label>
            <input
              id="public_id"
              name="public_id"
              type="text"
              required
              maxLength={20}
              value={publicId}
              onChange={e => setPublicId(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors font-mono tracking-widest uppercase"
              placeholder="MUT, AMIGOS2026, etc."
            />
            {state?.errors?.public_id && (
              <p className="text-[#C8102E] text-xs mt-1">{state.errors.public_id[0]}</p>
            )}
            <p className="text-[#8B8FA8] text-xs mt-1">Solo letras, números, - y _</p>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre del grupo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
              placeholder="Los Mutantes"
            />
            {state?.errors?.name && (
              <p className="text-[#C8102E] text-xs mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="access_password" className="block text-sm font-medium mb-1">
              Contraseña
              <span className="text-[#8B8FA8] font-normal ml-1">— la compartís con tu grupo</span>
            </label>
            <input
              id="access_password"
              name="access_password"
              type="text"
              required
              maxLength={30}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
              placeholder="ej: mundial2026"
            />
            {state?.errors?.access_password && (
              <p className="text-[#C8102E] text-xs mt-1">{state.errors.access_password[0]}</p>
            )}
          </div>

          {/* Modalidad */}
          <div className="space-y-3 pt-1">
            <p className="text-sm font-medium text-[#8B8FA8] uppercase tracking-wide">Modalidad de prode</p>
            <div className="space-y-2">
              {PREDICTION_MODE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`block rounded-xl border p-3 cursor-pointer transition-colors ${
                    predictionMode === option.value
                      ? 'border-[#C8102E] bg-[#C8102E]/10'
                      : 'border-[#2A2D4A] bg-[#0D0D1A] hover:border-[#2A2D4A]/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="prediction_mode"
                      value={option.value}
                      checked={predictionMode === option.value}
                      onChange={() => setPredictionMode(option.value)}
                      className="mt-1 accent-[#C8102E]"
                    />
                    <div>
                      <div className="text-sm font-bold">{option.label}</div>
                      <div className="text-xs text-[#8B8FA8] mt-0.5">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Opciones del grupo */}
          <div className="space-y-3 pt-1">
            <p className="text-sm font-medium text-[#8B8FA8] uppercase tracking-wide">Opciones</p>

            {[
              { name: 'predictions_visible', label: 'Ver predicciones de otros antes del partido' },
              { name: 'has_top_scorer',      label: 'Incluir máximo goleador (+5 pts)' },
              { name: 'has_top_assist',      label: 'Incluir máximo asistidor (+5 pts)' },
              { name: 'has_mvp',             label: 'Incluir MVP (+5 pts)' },
            ].map(opt => (
              <label key={opt.name} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={opt.name}
                  className="w-4 h-4 accent-[#C8102E]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>

          {state?.error && (
            <p className="text-[#C8102E] text-sm">{state.error}</p>
          )}

          {/* Preview */}
          {publicId && (
            <div className="bg-[#0D0D1A] rounded-xl p-3 border border-[#2A2D4A] text-xs text-[#8B8FA8]">
              Tus amigos van a buscar:{' '}
              <span className="text-white font-mono font-bold">{publicId}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            {pending ? 'Creando...' : 'Crear grupo'}
          </button>
        </form>
      </div>
    </div>
  )
}
