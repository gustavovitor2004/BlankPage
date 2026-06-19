'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Story } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Trash2, BookMarked } from 'lucide-react'

interface Props {
  story: Story
  chapterCount: number
  onDelete: (id: string) => void
}

export default function StoryCard({ story, chapterCount, onDelete }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover / thumbnail */}
      <Link href={`/historia/${story.id}`}>
        <div
          className="relative h-44 flex items-end overflow-hidden"
          style={{
            background: story.background_image_url
              ? undefined
              : 'var(--surface-2)',
          }}
        >
          {story.background_image_url ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
                style={{
                  backgroundImage: `url(${story.background_image_url})`,
                  filter: 'blur(2px)',
                  transform: hovered ? 'scale(1.04)' : 'scale(1.0)',
                  opacity: 0.7,
                }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <BookMarked size={32} style={{ color: 'var(--text-3)' }} />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/historia/${story.id}`}>
          <h3
            className="font-medium leading-snug mb-1 line-clamp-2"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
          >
            {story.title}
          </h3>
        </Link>
        {story.description && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-3)' }}>
            {story.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {chapterCount} {chapterCount === 1 ? 'capítulo' : 'capítulos'} · {formatDate(story.updated_at)}
          </span>
          <button
            onClick={e => { e.preventDefault(); onDelete(story.id) }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-3)' }}
            title="Excluir história"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
