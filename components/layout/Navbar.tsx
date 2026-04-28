import Link from 'next/link'
import { logout } from '@/app/(app)/actions'

type Props = {
  profile: { username: string; display_name: string | null; avatar_url: string | null } | null
  isAdmin?: boolean
}

export default function Navbar({ profile, isAdmin }: Props) {
  return (
    <header className="border-b border-[#2A2D4A] bg-[#0D0D1A]/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-black text-lg tracking-tight">
          <span className="text-[#C8102E]">PRO</span>
          <span className="text-white">DE</span>
          <span className="text-[#FFB81C] ml-1">2026</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-[#8B8FA8] hover:text-white transition-colors">
            Inicio
          </Link>
          <Link href="/calendario" className="text-[#8B8FA8] hover:text-white transition-colors">
            Calendario
          </Link>
          <Link href="/groups/join" className="text-[#8B8FA8] hover:text-white transition-colors">
            Unirse
          </Link>
          <Link href="/groups/create" className="text-[#8B8FA8] hover:text-white transition-colors">
            Crear grupo
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-[#FFB81C] hover:text-white transition-colors font-bold">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-[#C8102E] flex items-center justify-center font-bold text-xs">
              {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
            </div>
            <span className="hidden sm:block text-[#8B8FA8]">
              {profile?.display_name ?? profile?.username}
            </span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-[#8B8FA8] hover:text-white text-sm transition-colors px-2 py-1"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
