'use client'

import { useActionState, useState } from 'react'
import { updateGroupSettings } from './actions'

type Group = {
  id: string
  name: string
  public_id: string
  access_code: string
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

  function copyInviteInfo() {
    navigator.clipboard.writeText(
      `Grupo: ${group.name}\nID: ${group.public_id}\nCódigo: ${group.access_code}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-md">
      {/* Group info */}
      <div className="bg-[#1A1A2E] rounded-2xl p-5 border border-[#2A2D4A]">
        <h2 className="font-bold mb-4">Información del grupo</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8B8FA8]">ID del grupo</span>
            <span className="font-mono font-bold">{group.public_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B8FA8]">Código actual</span>
            <span className="font-mono font-bold">{group.access_code}</span>
          </div>
        </div>
        <button
          onClick={copyInviteInfo}
          className="mt-4 w-full py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-bold rounded-xl transition-colors"
        >
          {copied ? '✓ Copiado' : '📋 Copiar info de invitación'}
        </button>
      </div>

      {/* Edit settings */}
      <div className="bg-[#1A1A2E] rounded-2xl p-5 border border-[#2A2D4A]">
        <h2 className="font-bold mb-4">Editar configuración</h2>
        <form action={action} className="space-y-4">
          <input type="hidden" name="group_id" value={group.id} />

          <div>
            <label className="block text-sm font-medium mb-1">Nuevo código de acceso</label>
            <input
              name="access_code"
              type="text"
              maxLength={20}
              placeholder={group.access_code}
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <input
              name="access_password"
              type="password"
              placeholder="Dejar vacío para no cambiar"
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Predicciones visibles antes del partido</label>
              <p className="text-[#8B8FA8] text-xs mt-0.5">Si está activo, todos pueden ver las predicciones ajenas antes de que empiece el partido</p>
            </div>
            <input
              type="checkbox"
              name="predictions_visible"
              defaultChecked={group.predictions_visible}
              className="w-5 h-5 accent-[#C8102E]"
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
            <div key={m.user_id} className="flex items-center justify-between text-sm">
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
