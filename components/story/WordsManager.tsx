'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoryWord } from '@/lib/types'
import { Plus, Trash2, AtSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  storyId: string
  userId: string
  initialWords: StoryWord[]
}

export default function WordsManager({ storyId, userId, initialWords }: Props) {
  const [words, setWords] = useState(initialWords)
  const [wordInput, setWordInput] = useState('')
  const [shortcutInput, setShortcutInput] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    const word = wordInput.trim()
    if (!word) return

    const shortcut = shortcutInput.trim() || null
    const supabase = createClient()

    const { data, error } = await supabase
      .from('story_words')
      .insert({ story_id: storyId, user_id: userId, word, shortcut })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao adicionar palavra')
      return
    }

    setWords(prev => [...prev, data].sort((a, b) => a.word.localeCompare(b.word)))
    setWordInput('')
    setShortcutInput('')
    setAdding(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('story_words').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    setWords(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Palavras do autocomplete
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            No editor, digite <code className="px-1 rounded" style={{ background: 'var(--surface-2)' }}>@</code> + letras para sugerir
          </p>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{ color: 'var(--text-2)', background: 'var(--surface)' }}
        >
          <Plus size={13} />
          Adicionar
        </button>
      </div>

      {adding && (
        <div
          className="rounded-xl p-4 mb-3 flex flex-col gap-3"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>
                Palavra
              </label>
              <input
                autoFocus
                value={wordInput}
                onChange={e => setWordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="ex: Agni"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
            <div className="w-36">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>
                Atalho (opcional)
              </label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
                <span className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                <input
                  value={shortcutInput}
                  onChange={e => setShortcutInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="ag"
                  className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                  style={{ color: 'var(--text)' }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setAdding(false); setWordInput(''); setShortcutInput('') }}
              className="px-3 py-1.5 text-xs rounded-lg"
              style={{ color: 'var(--text-3)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!wordInput.trim()}
              className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {words.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{ border: '1.5px dashed var(--border-2)' }}
        >
          <AtSign size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
          <p className="text-sm" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-lora)' }}>
            Nenhuma palavra cadastrada ainda.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            Adicione nomes e termos para usar no autocomplete do editor.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {words.map(w => (
            <div
              key={w.id}
              className="group flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {w.word}
                </span>
                {w.shortcut && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-3)', fontFamily: 'monospace' }}
                  >
                    @{w.shortcut}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                style={{ color: 'var(--text-3)' }}
                title="Excluir"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
