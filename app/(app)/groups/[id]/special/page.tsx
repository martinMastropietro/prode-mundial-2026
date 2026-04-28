import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SpecialPredictionForm from './SpecialPredictionForm'
import type { SpecialPrediction, Group, Prediction } from '@/types'

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

  const hasExtras = group?.has_top_scorer || group?.has_top_assist || group?.has_mvp

  const { data: special } = await supabase
    .from('special_predictions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('group_id', groupId)
    .maybeSingle()

  // Predicción del partido Final (104) y 3° puesto (103) para mostrar el resumen
  const { data: finalPred } = await supabase
    .from('predictions')
    .select('*, home_team:match_id(home_team:home_team_id(name, flag_emoji), away_team:away_team_id(name, flag_emoji))')
    .eq('user_id', user!.id)
    .eq('group_id', groupId)
    .filter('match_id', 'in', `(${
      // Obtener IDs de los partidos 103 y 104
      (await supabase.from('matches').select('id').in('match_number', [103, 104])).data?.map(m => `"${m.id}"`).join(',') ?? ''
    })`)

  // Datos de partidos finales para mostrar equipos
  const { data: finalMatches } = await supabase
    .from('matches')
    .select('id, match_number, home_team:home_team_id(name, flag_emoji), away_team:away_team_id(name, flag_emoji), status')
    .in('match_number', [103, 104])

  const locked = new Date() >= LOCK_DATE

  // Predicciones en otros grupos para importar extras
  const { data: otherPredictions } = await supabase
    .from('special_predictions')
    .select('*, group:groups(name, public_id)')
    .eq('user_id', user!.id)
    .neq('group_id', groupId)

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Predicción especial</h1>
      <p className="text-[#8B8FA8] text-sm mb-6">
        {locked ? 'Cerrada.' : `Se cierra el ${LOCK_DATE.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`}
      </p>

      {/* Campeón/Sub/3ro se derivan del bracket */}
      <div className="bg-[#1A1A2E] rounded-xl p-5 border border-[#2A2D4A] mb-5">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          🏆 Campeón · Subcampeón · 3° puesto
          <span className="text-xs text-[#8B8FA8] font-normal">(se derivan de tu predicción del cuadro)</span>
        </h2>

        {finalMatches && finalMatches.length > 0 ? (
          <div className="space-y-2">
            {[104, 103].map(num => {
              const match = finalMatches.find((m: any) => m.match_number === num)
              const pred = finalPred?.find((p: any) => {
                // This won't work directly, need different approach
                return false
              })
              return (
                <div key={num} className="flex items-center justify-between text-sm">
                  <span className="text-[#8B8FA8]">{num === 104 ? '🥇 Final' : '🥉 3° Puesto'}</span>
                  {(match as any)?.home_team ? (
                    <span className="text-[#8B8FA8] text-xs">
                      {(match as any).home_team?.name ?? '?'} vs {(match as any).away_team?.name ?? '?'}
                      <span className="text-[#FFB81C] ml-2">
                        {num === 104 ? '15+10 pts si acertás el ganador' : '5 pts si acertás el ganador'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#8B8FA8] text-xs">Los equipos se definen en las semis</span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[#8B8FA8] text-xs">Predecí los partidos del cuadro para ver quién llega a la Final.</p>
        )}

        <Link
          href={`/groups/${groupId}/matches`}
          className="mt-3 inline-block text-xs text-[#C8102E] hover:underline"
        >
          → Ir a predecir el cuadro eliminatorio
        </Link>
      </div>

      {/* Extras: goleador, asistidor, MVP */}
      {hasExtras ? (
        <>
          <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2A2D4A] mb-5">
            <div className="flex flex-wrap gap-4">
              {group?.has_top_scorer && <div className="text-center"><div className="text-[#FFB81C] font-black">5 pts</div><div className="text-[#8B8FA8] text-xs">⚽ Goleador</div></div>}
              {group?.has_top_assist && <div className="text-center"><div className="text-[#FFB81C] font-black">5 pts</div><div className="text-[#8B8FA8] text-xs">🎯 Asistidor</div></div>}
              {group?.has_mvp && <div className="text-center"><div className="text-[#FFB81C] font-black">5 pts</div><div className="text-[#8B8FA8] text-xs">⭐ MVP</div></div>}
            </div>
          </div>

          <SpecialPredictionForm
            existing={special as SpecialPrediction | null}
            locked={locked}
            groupId={groupId}
            group={group as Pick<Group, 'has_top_scorer' | 'has_top_assist' | 'has_mvp'>}
            otherPredictions={(otherPredictions ?? []) as any[]}
          />
        </>
      ) : (
        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-[#2A2D4A] text-center">
          <p className="text-[#8B8FA8] text-sm">Este grupo no tiene predicciones extras activadas.</p>
          <p className="text-[#8B8FA8] text-xs mt-1">El admin puede activar goleador, asistidor y MVP en la configuración del grupo.</p>
        </div>
      )}
    </div>
  )
}
