import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StoryClient from './StoryClient'

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: story },
    { data: chapters },
    { data: storyWords },
  ] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('chapters').select('*').eq('story_id', id).order('order_index', { ascending: true }),
    supabase.from('story_words').select('*').eq('story_id', id).eq('user_id', user.id).order('word'),
  ])

  if (!story) notFound()

  return (
    <StoryClient
      story={story}
      initialChapters={chapters || []}
      initialWords={storyWords || []}
      userId={user.id}
    />
  )
}
