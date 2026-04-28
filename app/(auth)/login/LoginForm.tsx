'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { login } from './actions'

export default function LoginForm({ justRegistered }: { justRegistered: boolean }) {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/10 via-[#0A0A16] to-[#003087]/10 pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="relative w-16 h-16 drop-shadow-[0_0_20px_rgba(255,184,28,0.3)]">
              <Image src="/logo.png" alt="FIFA World Cup 2026" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-[#C8102E]">PRO</span>DE <span className="text-[#FFB81C]">'26</span>
          </h1>
          <p className="text-[#8B8FA8] mt-1">Iniciá sesión para continuar</p>
        </div>

        {justRegistered && (
          <div className="bg-[#00A651]/10 border border-[#00A651]/30 rounded-xl p-3 mb-4 text-center">
            <p className="text-[#00A651] text-sm font-medium">
              ¡Cuenta creada! Revisá tu email y confirmá para iniciar sesión.
            </p>
          </div>
        )}

        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium mb-1">
                Email o usuario
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="tu@email.com o tu_usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="text-[#C8102E] text-sm">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              {pending ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8B8FA8] text-sm mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-[#FFB81C] hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  )
}
