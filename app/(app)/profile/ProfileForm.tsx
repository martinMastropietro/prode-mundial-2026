'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'

type Profile = {
  id: string
  username: string
  display_name: string | null
}

type Props = { profile: Profile | null; email: string }

export default function ProfileForm({ profile, email }: Props) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
      {/* Avatar placeholder */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#C8102E] flex items-center justify-center font-black text-3xl">
          {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-[#8B8FA8] cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
          <input
            type="text"
            value={profile?.username ?? ''}
            disabled
            className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-[#8B8FA8] cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium mb-1">
            Nombre visible
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            defaultValue={profile?.display_name ?? ''}
            maxLength={50}
            className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
            placeholder="Cómo querés que te vean"
          />
        </div>

        {state?.error && <p className="text-[#C8102E] text-sm">{state.error}</p>}
        {state?.success && <p className="text-[#00A651] text-sm">Perfil actualizado.</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
