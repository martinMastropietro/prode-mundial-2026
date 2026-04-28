'use client'

import { useActionState } from 'react'
import { createGroup } from './actions'

export default function CreateGroupPage() {
  const [state, action, pending] = useActionState(createGroup, undefined)

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-black mb-6">Crear grupo</h1>

      <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
        <form action={action} className="space-y-5">
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
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
              placeholder="Los Mutantes"
            />
            {state?.errors?.name && (
              <p className="text-[#C8102E] text-xs mt-1">{state.errors.name[0]}</p>
            )}
          </div>

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
              className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
              placeholder="ej: mundial2026"
            />
            {state?.errors?.access_password && (
              <p className="text-[#C8102E] text-xs mt-1">{state.errors.access_password[0]}</p>
            )}
          </div>

          {state?.error && (
            <p className="text-[#C8102E] text-sm">{state.error}</p>
          )}

          <div className="bg-[#0D0D1A] rounded-xl p-4 border border-[#2A2D4A]">
            <p className="text-[#8B8FA8] text-xs">
              Se genera un <strong className="text-white">ID único</strong> para tu grupo (ej: WC26-PSASP8).
              Compartí ese ID + contraseña para que tus amigos puedan unirse.
            </p>
          </div>

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
