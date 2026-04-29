'use client'

import { useActionState, useState } from 'react'
import { updateGroupSettings } from './actions'
import { normalizePredictionMode, PREDICTION_MODE_DESCRIPTIONS, PREDICTION_MODE_LABELS } from '@/lib/utils/predictionModes'

type Group = {
  id: string
  name: string
  public_id: string
  prediction_mode?: string
  predictions_visible: boolean
}

type Member = {
  user_id: string
  role: string
  joined_at: string
  profile: { username: string; display_name: string | null } | null
}

type Props = { group: Group; members: Member[] }

export default function GroupSettingsForm({ group, members }: Props) {
  const [state, action, pending] = useActionState(updateGroupSettings, undefined)
  const [copied, setCopied] = useState(false)
  const predictionMode = normalizePredictionMode(group.prediction_mode)

  function copyInviteInfo() {
    navigator.clipboard.writeText(`ID: ${group.public_id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-md">
      {/* Invite card */}
      <div className="bg-gradient-to-r from-[#C8102E]/10 to-[#003087]/10 rounded-2xl p-5 border border-[#2A2D4A]">
        <h2 className="font-bold mb-3">Invitar al grupo</h2>
        <p className="text-[#8B8FA8] text-xs mb-3">
          Compartí el ID con tus amigos. Ellos lo ingresan en "Unirse a un grupo" junto con la contraseña.
        </p>
        <div className="flex items-center gap-3 bg-[#0D0D1A] rounded-xl px-4 py-3 border border-[#2A2D4A]">
          <span className="font-mono font-black text-[#FFB81C] text-lg tracking-widest flex-1">
            {group.public_id}
          </span>
          <button
            onClick={copyInviteInfo}
            className="text-xs px-3 py-1.5 bg-[#003087] hover:bg-[#00246b] text-white font-bold rounded-lg transition-colors"
          >
            {copied ? '✓' : '📋 Copiar'}
          </button>
        </div>
      </div>

      {/* Edit settings */}
      <div className="bg-[#1A1A2E] rounded-2xl p-5 border border-[#2A2D4A]">
        <h2 className="font-bold mb-4">Configuración</h2>
        <form action={action} className="space-y-4">
          <input type="hidden" name="group_id" value={group.id} />

          <div className="rounded-xl border border-[#2A2D4A] bg-[#0D0D1A] p-3">
            <div className="text-sm font-bold">{PREDICTION_MODE_LABELS[predictionMode]}</div>
            <p className="text-[#8B8FA8] text-xs mt-1">{PREDICTION_MODE_DESCRIPTIONS[predictionMode]}</p>
            <p className="text-[#8B8FA8] text-[11px] mt-2">La modalidad se define al crear el grupo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nueva contraseña
            </label>
            <input
              name="access_password"
              type="text"
              maxLength={30}
              placeholder="Dejar vacío para no cambiar"
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <label className="block text-sm font-medium">Predicciones visibles antes del partido</label>
              <p className="text-[#8B8FA8] text-xs mt-0.5">
                Todos pueden ver las predicciones ajenas antes de que empiece el partido
              </p>
            </div>
            <input
              type="checkbox"
              name="predictions_visible"
              defaultChecked={group.predictions_visible}
              className="w-5 h-5 accent-[#C8102E] ml-4 flex-shrink-0"
            />
          </div>

          {state?.error && <p className="text-[#C8102E] text-sm">{state.error}</p>}
          {state?.success && <p className="text-[#00A651] text-sm">Cambios guardados.</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Members */}
      <div className="bg-[#1A1A2E] rounded-2xl p-5 border border-[#2A2D4A]">
        <h2 className="font-bold mb-4">Miembros ({members.length})</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between text-sm py-1">
              <span>{m.profile?.display_name ?? m.profile?.username ?? m.user_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                m.role === 'admin'
                  ? 'bg-[#FFB81C]/20 text-[#FFB81C]'
                  : 'bg-[#2A2D4A] text-[#8B8FA8]'
              }`}>
                {m.role === 'admin' ? 'Admin' : 'Miembro'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
