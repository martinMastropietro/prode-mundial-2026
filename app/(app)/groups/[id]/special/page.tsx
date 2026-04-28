import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SpecialPredictionForm from './SpecialPredictionForm'
import type { Team, SpecialPrediction, Group } from '@/types'

type Props = { params: Promise<{ id: string }> }

const LOCK_DATE = new Date('2026-06-11T00:00:00Z')

export default async function SpecialPredictionPage({ params }: Props) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!membership) redirect('/dashboard')

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, has_top_scorer, has_top_assist, has_mvp')
    .eq('id', groupId)
    .single()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, code, flag_emoji')
    .order('name')

  const { data: special } = await supabase
    .from('special_predictions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('group_id', groupId)
    .maybeSingle()

  // Predicciones en otros grupos para importar
  const { data: otherPredictions } = await supabase
    .from('special_predictions')
    .select('*, group:groups(name, public_id)')
    .eq('user_id', user!.id)
    .neq('group_id', groupId)

  const locked = special?.locked_at ? true : new Date() >= LOCK_DATE

  const pointsBreakdown = [
    { label: 'Campeón', pts: '15 pts' },
    { label: 'Subcampeón', pts: '10 pts' },
    { label: '3er puesto', pts: '5 pts' },
    ...(group?.has_top_scorer ? [{ label: '⚽ Goleador', pts: '5 pts' }] : []),
    ...(group?.has_top_assist ? [{ label: '🎯 Asistidor', pts: '5 pts' }] : []),
    ...(group?.has_mvp ? [{ label: '⭐ MVP', pts: '5 pts' }] : []),
  ]

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Predicción especial</h1>
      <p className="text-[#8B8FA8] text-sm mb-4">
        {locked
          ? 'Cerrada — no se puede modificar.'
          : `Se cierra el ${LOCK_DATE.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} · Esta predicción es permanente en este grupo`}
      </p>

      <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A] mb-5">
        <div className="flex flex-wrap gap-4">
          {pointsBreakdown.map(p => (
            <div key={p.label} className="text-center">
              <div className="text-[#FFB81C] font-black">{p.pts}</div>
              <div className="text-[#8B8FA8] text-xs">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SpecialPredictionForm
        teams={(teams ?? []) as Team[]}
        existing={special as SpecialPrediction | null}
        locked={locked}
        groupId={groupId}
        group={group as Pick<Group, 'has_top_scorer' | 'has_top_assist' | 'has_mvp'>}
        otherPredictions={(otherPredictions ?? []) as any[]}
      />
    </div>
  )
}
