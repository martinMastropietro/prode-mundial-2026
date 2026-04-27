import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SpecialPredictionForm from './SpecialPredictionForm'
import type { Team, SpecialPrediction } from '@/types'

type Props = { params: Promise<{ id: string }> }

// Unlock cutoff: first match of the tournament
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

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, code, flag_emoji')
    .order('name')

  const { data: special } = await supabase
    .from('special_predictions')
    .select('*, champion_team:champion_team_id(name, flag_emoji), runner_up_team:runner_up_team_id(name, flag_emoji), third_place_team:third_place_team_id(name, flag_emoji)')
    .eq('user_id', user!.id)
    .eq('group_id', groupId)
    .maybeSingle()

  const locked = special?.locked_at ? true : new Date() >= LOCK_DATE

  return (
    <div>
      <h1 className="text-2xl font-black mb-2">Predicciones especiales</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">
        {locked
          ? 'Las predicciones especiales están cerradas.'
          : `Se cierran el ${LOCK_DATE.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`}
      </p>

      <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A] mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Campeón', pts: '15 pts', color: 'text-[#FFB81C]' },
            { label: 'Subcampeón', pts: '10 pts', color: 'text-[#C0C0C0]' },
            { label: '3er puesto', pts: '5 pts', color: 'text-[#CD7F32]' },
          ].map((item) => (
            <div key={item.label}>
              <div className={`font-black text-lg ${item.color}`}>{item.pts}</div>
              <div className="text-[#8B8FA8] text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SpecialPredictionForm
        teams={(teams ?? []) as Team[]}
        existing={special as SpecialPrediction | null}
        locked={locked}
        groupId={groupId}
      />
    </div>
  )
}
