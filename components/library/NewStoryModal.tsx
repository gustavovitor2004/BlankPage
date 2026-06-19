'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreate: (title: string, description: string) => void
}

export default function NewStoryModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(title.trim(), description.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem' }}>
            Nova história
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-3)' }}>
              Título
            </label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Nome da sua história"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-3)' }}>
              Sinopse <span className="normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Uma breve descrição…"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm"
              style={{ color: 'var(--text-2)', background: 'var(--surface)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
