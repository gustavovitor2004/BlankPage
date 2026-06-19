'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Plus, BookOpen, Pencil, Trash2, Moon, Sun,
  GripVertical, BookMarked,
} from 'lucide-react'
import { Story, Chapter } from '@/lib/types'
import { formatDate, countWords } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  story: Story
  initialChapters: Chapter[]
  userId: string
}

export default function StoryClient({ story, initialChapters, userId }: Props) {
  const router = useRouter()
  const [chapters, setChapters] = useState(initialChapters)
  const [storyTitle, setStoryTitle] = useState(story.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleSaveTitle() {
    if (!storyTitle.trim()) { setStoryTitle(story.title); setEditingTitle(false); return }
    const supabase = createClient()
    await supabase.from('stories').update({ title: storyTitle }).eq('id', story.id)
    setEditingTitle(false)
  }

  async function handleNewChapter() {
    const supabase = createClient()
    const newIndex = chapters.length
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        story_id: story.id,
        user_id: userId,
        title: `Capítulo ${newIndex + 1}`,
        order_index: newIndex,
      })
      .select()
      .single()

    if (error) { toast.error('Erro ao criar capítulo'); return }
    setChapters(prev => [...prev, data])
    router.push(`/historia/${story.id}/capitulo/${data.id}`)
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!confirm('Excluir este capítulo? Esta ação não pode ser desfeita.')) return
    const supabase = createClient()
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId)
    if (error) { toast.error('Erro ao excluir'); return }
    setChapters(prev => prev.filter(c => c.id !== chapterId))
    toast.success('Capítulo excluído')
  }

  const totalWords = chapters.reduce((sum, c) => sum + countWords(c.content_text || ''), 0)

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-20" style={{
        borderColor: 'var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/biblioteca"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-3)' }}
          >
            <ArrowLeft size={16} />
            Biblioteca
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/historia/${story.id}/ler`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-2)', background: 'var(--surface)' }}
            >
              <BookOpen size={14} />
              Ler
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: 'var(--text-3)' }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Story title */}
        <div className="mb-2">
          {editingTitle ? (
            <input
              autoFocus
              value={storyTitle}
              onChange={e => setStoryTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              className="text-4xl font-light w-full outline-none bg-transparent border-b pb-1"
              style={{
                color: 'var(--text)',
                fontFamily: 'var(--font-cormorant)',
                borderColor: 'var(--border-2)',
              }}
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="group flex items-center gap-2"
            >
              <h1
                className="text-4xl font-light text-left"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-cormorant)', lineHeight: 1.2 }}
              >
                {storyTitle}
              </h1>
              <Pencil
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-3)' }}
              />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-10 text-sm" style={{ color: 'var(--text-3)' }}>
          <span>{chapters.length} {chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
          <span>·</span>
          <span>{totalWords.toLocaleString('pt-BR')} palavras</span>
          <span>·</span>
          <span>Atualizada {formatDate(story.updated_at)}</span>
        </div>

        {/* Chapters */}
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="group flex items-center gap-3 rounded-xl p-4 transition-all"
              style={{ background: 'var(--surface)' }}
            >
              <GripVertical size={16} style={{ color: 'var(--text-3)' }} className="shrink-0 opacity-0 group-hover:opacity-100" />

              <div className="flex-1 min-w-0">
                <Link
                  href={`/historia/${story.id}/capitulo/${chapter.id}`}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                      {chapter.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {countWords(chapter.content_text || '')} palavras · {formatDate(chapter.updated_at)}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/historia/${story.id}/capitulo/${chapter.id}`}
                  className="p-1.5 rounded-lg"
                  style={{ color: 'var(--text-3)' }}
                  title="Editar"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => handleDeleteChapter(chapter.id)}
                  className="p-1.5 rounded-lg"
                  style={{ color: 'var(--text-3)' }}
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* New chapter button */}
        <button
          onClick={handleNewChapter}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
          style={{
            border: '1.5px dashed var(--border-2)',
            color: 'var(--text-3)',
          }}
        >
          <Plus size={16} />
          Novo capítulo
        </button>

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <BookMarked size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
            <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-lora)' }}>
              Nenhum capítulo ainda.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
