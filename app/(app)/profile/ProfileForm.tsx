'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { updateProfile } from './actions'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type Props = { profile: Profile | null; email: string }

export default function ProfileForm({ profile, email }: Props) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24 rounded-full bg-[#C8102E] flex items-center justify-center font-black text-3xl overflow-hidden border border-[#2A2D4A]">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Foto de perfil"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            (profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()
          )}
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium mb-1">
            Foto de perfil
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="w-full text-sm text-[#8B8FA8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#003087] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#0040b8]"
          />
          <p className="mt-1 text-xs text-[#8B8FA8]">JPG, PNG o WebP. Máximo 2 MB.</p>
        </div>

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
