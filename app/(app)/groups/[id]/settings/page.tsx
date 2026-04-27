import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupSettingsForm from './GroupSettingsForm'

type Props = { params: Promise<{ id: string }> }

export default async function GroupSettingsPage({ params }: Props) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!membership || membership.role !== 'admin') redirect(`/groups/${groupId}`)

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role, joined_at, profile:profiles(username, display_name)')
    .eq('group_id', groupId)
    .order('joined_at')

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Configuración del grupo</h1>
      <GroupSettingsForm group={group} members={(members ?? []) as unknown as Parameters<typeof GroupSettingsForm>[0]['members']} />
    </div>
  )
}
