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

  const [{ data: story }, { data: chapter }, { data: allChapters }] = await Promise.all([
    supabase.from('stories').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('chapters').select('*').eq('id', chapterId).eq('user_id', user.id).single(),
    supabase.from('chapters').select('content_text').eq('story_id', id).eq('user_id', user.id),
  ])

  if (!story || !chapter) notFound()

  const allText = (allChapters || []).map(c => c.content_text || '').join(' ')

  return (
    <EditorPage
      story={story}
      chapter={chapter}
      allChaptersText={allText}
    />
  )
}
