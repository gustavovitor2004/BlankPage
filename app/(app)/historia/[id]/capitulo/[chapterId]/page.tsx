import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditorPage from './EditorPage'

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>
}) {
  const { id, chapterId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: story },
    { data: chapter },
    { data: storyWords },
    { data: userSettings },
  ] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('chapters').select('*').eq('id', chapterId).eq('user_id', user.id).single(),
    supabase.from('story_words').select('*').eq('story_id', id).eq('user_id', user.id).order('word'),
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  if (!story || !chapter) notFound()

  return (
    <EditorPage
      story={story}
      chapter={chapter}
      storyWords={storyWords || []}
      userSettings={userSettings}
    />
  )
}
