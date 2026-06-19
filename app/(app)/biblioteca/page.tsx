import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LibraryClient from './LibraryClient'

export default async function LibraryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stories } = await supabase
    .from('stories')
    .select('*, chapters(id)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return <LibraryClient initialStories={stories || []} userId={user.id} />
}
