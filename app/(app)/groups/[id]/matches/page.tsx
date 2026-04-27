import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MatchList from '@/components/matches/MatchList'
import type { Match, Prediction } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function GroupMatchesPage({ params }: Props) {
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

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:home_team_id(id, name, code, flag_emoji),
      away_team:away_team_id(id, name, code, flag_emoji)
    `)
    .order('match_date', { ascending: true, nullsFirst: false })

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('group_id', groupId)

  const predictionMap = new Map<string, Prediction>()
  predictions?.forEach((p) => predictionMap.set(p.match_id, p))

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Partidos</h1>
      <MatchList
        matches={(matches ?? []) as unknown as Match[]}
        predictionMap={predictionMap}
        groupId={groupId}
      />
    </div>
  )
}
