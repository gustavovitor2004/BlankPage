'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Story, Chapter } from '@/lib/types'
import BookView from '@/components/reading/BookView'
import { ArrowLeft, Moon, Sun } from 'lucide-react'

interface Props {
  story: Story
  chapters: Chapter[]
}

export default function ReadingClient({ story, chapters }: Props) {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#111110' : '#E8E2D5' }}>
      {/* Minimal header */}
      <header className="flex items-center justify-between px-8 h-12" style={{ color: isDark ? '#8B857A' : '#6B6159' }}>
        <Link
          href={`/historia/${story.id}`}
          className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={15} />
          {story.title}
        </Link>
        <button onClick={toggleTheme} className="p-1.5">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center pb-12 px-4">
        <div className="w-full max-w-5xl">
          <BookView story={story} chapters={chapters} isDark={isDark} />
        </div>
      </main>
    </div>
  )
}
