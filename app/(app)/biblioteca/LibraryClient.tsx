'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, LogOut, Moon, Sun, Feather } from 'lucide-react'
import { Story } from '@/lib/types'
import StoryCard from '@/components/library/StoryCard'
import NewStoryModal from '@/components/library/NewStoryModal'
import toast from 'react-hot-toast'

interface Props {
  initialStories: (Story & { chapters: { id: string }[] })[]
  userId: string
}

export default function LibraryClient({ initialStories, userId }: Props) {
  const router = useRouter()
  const [stories, setStories] = useState(initialStories)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleNewStory(title: string, description: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stories')
      .insert({ user_id: userId, title, description })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar história')
      return
    }

    setStories(prev => [{ ...data, chapters: [] }, ...prev])
    setShowNewModal(false)
    toast.success('História criada!')
  }

  async function handleDeleteStory(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('stories').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    setStories(prev => prev.filter(s => s.id !== id))
    toast.success('História excluída')
  }

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather size={18} style={{ color: 'var(--text-3)' }} />
            <span className="text-sm font-medium tracking-wide" style={{
              color: 'var(--text-2)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.1rem',
            }}>
              Escrever
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-3)' }}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-3)' }}
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title row */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-light" style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-cormorant)',
              lineHeight: 1.2,
            }}>
              Biblioteca
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
              {stories.length === 0
                ? 'Nenhuma história ainda'
                : `${stories.length} ${stories.length === 1 ? 'história' : 'histórias'}`}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <Plus size={16} />
            Nova história
          </button>
        </div>

        {/* Stories grid */}
        {stories.length === 0 ? (
          <div className="text-center py-24">
            <Feather size={36} className="mx-auto mb-4" style={{ color: 'var(--text-3)' }} />
            <p className="text-lg" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-lora)' }}>
              Sua biblioteca está vazia.
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>
              Comece criando sua primeira história.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-6 px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Criar história
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                chapterCount={story.chapters?.length ?? 0}
                onDelete={handleDeleteStory}
              />
            ))}
          </div>
        )}
      </main>

      {showNewModal && (
        <NewStoryModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleNewStory}
        />
      )}
    </div>
  )
}
