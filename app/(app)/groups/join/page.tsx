'use client'

import { useActionState, useState } from 'react'
import { searchGroup, joinGroup } from './actions'

export default function JoinGroupPage() {
  const [searchState, searchAction, searchPending] = useActionState(searchGroup, undefined)
  const [joinState, joinAction, joinPending] = useActionState(joinGroup, undefined)
  const [groupId, setGroupId] = useState('')

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-black mb-6">Unirse a un grupo</h1>

      {/* Step 1: Search */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A] mb-4">
        <h2 className="font-bold mb-4 text-sm text-[#8B8FA8] uppercase tracking-wide">
          Paso 1 · Buscar por ID
        </h2>
        <form action={searchAction} className="flex gap-3">
          <input
            name="public_id"
            type="text"
            required
            value={groupId}
            onChange={(e) => setGroupId(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors uppercase"
            placeholder="WC26-XXXXXX"
            maxLength={11}
          />
          <button
            type="submit"
            disabled={searchPending}
            className="px-5 py-3 bg-[#003087] hover:bg-[#00246b] disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {searchPending ? '...' : 'Buscar'}
          </button>
        </form>
        {searchState?.error && (
          <p className="text-[#C8102E] text-sm mt-2">{searchState.error}</p>
        )}
      </div>

      {/* Step 2: Join */}
      {searchState?.group && (
        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
          <h2 className="font-bold mb-1 text-sm text-[#8B8FA8] uppercase tracking-wide">
            Paso 2 · Ingresar credenciales
          </h2>
          <div className="bg-[#0D0D1A] rounded-xl p-4 border border-[#2A2D4A] mb-4">
            <p className="text-xs text-[#8B8FA8]">Grupo encontrado</p>
            <p className="font-bold text-lg">{searchState.group.name}</p>
            <p className="text-[#8B8FA8] text-sm">{searchState.group.public_id}</p>
          </div>

          <form action={joinAction} className="space-y-4">
            <input type="hidden" name="group_id" value={searchState.group.id} />

            <div>
              <label htmlFor="access_code" className="block text-sm font-medium mb-1">
                Código de acceso
              </label>
              <input
                id="access_code"
                name="access_code"
                type="text"
                required
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors uppercase"
                placeholder="Código del grupo"
              />
            </div>

            <div>
              <label htmlFor="access_password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                id="access_password"
                name="access_password"
                type="password"
                required
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {joinState?.error && (
              <p className="text-[#C8102E] text-sm">{joinState.error}</p>
            )}

            <button
              type="submit"
              disabled={joinPending}
              className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              {joinPending ? 'Uniéndose...' : 'Unirse al grupo'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
