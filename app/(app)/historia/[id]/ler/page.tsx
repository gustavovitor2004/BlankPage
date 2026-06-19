import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReadingClient from './ReadingClient'

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!story) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', id)
    .order('order_index', { ascending: true })

  return <ReadingClient story={story} chapters={chapters || []} />
}
