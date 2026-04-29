import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('role, group:groups(id, public_id, name)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  const groups = (memberships ?? []).map(m => ({
    ...(m.group as unknown as { id: string; public_id: string; name: string }),
    role: m.role,
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">Grupos</h1>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/groups/create"
          className="bg-[#1A1A2E] hover:bg-[#16213E] border border-[#2A2D4A] hover:border-[#C8102E]/40 rounded-2xl p-5 text-center transition-colors"
        >
          <div className="text-3xl mb-2">➕</div>
          <div className="font-bold text-sm">Crear grupo</div>
          <div className="text-[#8B8FA8] text-xs mt-1">Invitá a tus amigos</div>
        </Link>
        <Link
          href="/groups/join"
          className="bg-[#1A1A2E] hover:bg-[#16213E] border border-[#2A2D4A] hover:border-[#003087]/40 rounded-2xl p-5 text-center transition-colors"
        >
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold text-sm">Unirse a un grupo</div>
          <div className="text-[#8B8FA8] text-xs mt-1">Buscá por ID</div>
        </Link>
      </div>

      {/* Mis grupos */}
      {groups.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-3">Mis grupos</h2>
          <div className="grid gap-3">
            {groups.map(g => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="bg-[#1A1A2E] hover:bg-[#16213E] rounded-2xl p-4 border border-[#2A2D4A] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">{g.name}</div>
                  <div className="text-[#8B8FA8] text-sm font-mono">{g.public_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {g.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-[#FFB81C]/20 text-[#FFB81C] text-xs font-bold rounded-full">ADMIN</span>
                  )}
                  <span className="text-[#8B8FA8]">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {groups.length === 0 && (
        <div className="bg-[#1A1A2E] rounded-2xl p-8 border border-[#2A2D4A] text-center text-[#8B8FA8]">
          Todavía no pertenecés a ningún grupo.
        </div>
      )}
    </div>
  )
}
