'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Story, Chapter } from '@/lib/types'
import { countWords, extractNames } from '@/lib/utils'
import RichEditor from '@/components/editor/RichEditor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import BackgroundSettings from '@/components/editor/BackgroundSettings'
import { ArrowLeft, Moon, Sun, Settings2, BookOpen } from 'lucide-react'

interface Props {
  story: Story
  chapter: Chapter
  allChaptersText: string
}

export default function EditorPage({ story, chapter, allChaptersText }: Props) {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  const [showBgSettings, setShowBgSettings] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [wordCount, setWordCount] = useState(countWords(chapter.content_text || ''))
  const [chapterTitle, setChapterTitle] = useState(chapter.title)
  const [bgUrl, setBgUrl] = useState<string | null>(chapter.background_image_url)
  const [bgOpacity, setBgOpacity] = useState(chapter.background_opacity ?? 0.5)
  const [bgBlur, setBgBlur] = useState(chapter.background_blur ?? 4)
  const [font, setFont] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('editorFont') || 'Lora') : 'Lora'
  )
  const [fontSize, setFontSize] = useState(() =>
    typeof window !== 'undefined' ? (Number(localStorage.getItem('editorFontSize')) || 18) : 18
  )
  const [lineHeight, setLineHeight] = useState(() =>
    typeof window !== 'undefined' ? (Number(localStorage.getItem('editorLineHeight')) || 1.8) : 1.8
  )
  const [paraSpacing, setParaSpacing] = useState(() =>
    typeof window !== 'undefined' ? (Number(localStorage.getItem('editorParaSpacing')) || 20) : 20
  )

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const allTerms = extractNames(allChaptersText)

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleChange = useCallback((json: Record<string, unknown>, text: string) => {
    setWordCount(countWords(text))
    setSaveStatus('unsaved')

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      const supabase = createClient()
      await supabase
        .from('chapters')
        .update({ content: json, content_text: text })
        .eq('id', chapter.id)
      setSaveStatus('saved')
    }, 1200)
  }, [chapter.id])

  async function handleTitleBlur() {
    if (!chapterTitle.trim()) return
    const supabase = createClient()
    await supabase.from('chapters').update({ title: chapterTitle }).eq('id', chapter.id)
  }

  async function handleBgUpdate(url: string | null, opacity: number, blur: number) {
    setBgUrl(url)
    setBgOpacity(opacity)
    setBgBlur(blur)
    const supabase = createClient()
    await supabase.from('chapters').update({
      background_image_url: url,
      background_opacity: opacity,
      background_blur: blur,
    }).eq('id', chapter.id)
  }

  function handleFontChange(f: string) {
    setFont(f)
    localStorage.setItem('editorFont', f)
  }
  function handleFontSizeChange(s: number) {
    setFontSize(s)
    localStorage.setItem('editorFontSize', String(s))
  }
  function handleLineHeightChange(h: number) {
    setLineHeight(h)
    localStorage.setItem('editorLineHeight', String(h))
  }
  function handleParaSpacingChange(p: number) {
    setParaSpacing(p)
    localStorage.setItem('editorParaSpacing', String(p))
  }

  const statusText = saveStatus === 'saving' ? 'Salvando…' : saveStatus === 'saved' ? 'Salvo' : '●'

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg)' }}>
      {/* Background image layer */}
      {bgUrl && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgUrl})`,
              filter: `blur(${bgBlur}px)`,
              opacity: bgOpacity,
              transform: 'scale(1.05)',
            }}
          />
        </div>
      )}

      {/* Top bar */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          borderColor: 'var(--border)',
          background: bgUrl ? 'rgba(var(--bg-rgb, 250,250,248), 0.85)' : 'var(--bg)',
          backdropFilter: bgUrl ? 'blur(8px)' : undefined,
        }}
      >
        <div className="flex items-center justify-between px-6 h-12">
          <div className="flex items-center gap-3">
            <Link
              href={`/historia/${story.id}`}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-3)' }}
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{story.title}</span>
            </Link>
            <span style={{ color: 'var(--border-2)' }}>/</span>
            <input
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-sm font-medium bg-transparent outline-none border-none"
              style={{ color: 'var(--text-2)', minWidth: 80, maxWidth: 200 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {wordCount.toLocaleString('pt-BR')} palavras
            </span>
            <span
              className="text-xs"
              style={{ color: saveStatus === 'unsaved' ? '#F87171' : 'var(--text-3)' }}
            >
              {statusText}
            </span>
            <Link
              href={`/historia/${story.id}/ler`}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-3)' }}
              title="Modo leitura"
            >
              <BookOpen size={15} />
            </Link>
            <button
              onClick={() => setShowBgSettings(!showBgSettings)}
              className="p-1.5 rounded-lg"
              style={{ color: showBgSettings ? 'var(--text)' : 'var(--text-3)' }}
              title="Configurações"
            >
              <Settings2 size={15} />
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Formatting toolbar */}
          <EditorToolbar
            font={font}
            fontSize={fontSize}
            lineHeight={lineHeight}
            paraSpacing={paraSpacing}
            onFontChange={handleFontChange}
            onFontSizeChange={handleFontSizeChange}
            onLineHeightChange={handleLineHeightChange}
            onParaSpacingChange={handleParaSpacingChange}
            storyId={story.id}
            chapterId={chapter.id}
          />

          {/* Editor */}
          <div className="flex-1 overflow-auto">
            <div
              className="max-w-3xl mx-auto px-8 py-10"
              style={{
                '--para-spacing': `${paraSpacing}px`,
              } as React.CSSProperties}
            >
              <RichEditor
                initialContent={chapter.content}
                onChange={handleChange}
                font={font}
                fontSize={fontSize}
                lineHeight={lineHeight}
                suggestions={allTerms}
              />
            </div>
          </div>
        </div>

        {/* Right panel: background settings */}
        {showBgSettings && (
          <BackgroundSettings
            storyId={story.id}
            userId={story.user_id}
            currentUrl={bgUrl}
            opacity={bgOpacity}
            blur={bgBlur}
            onUpdate={handleBgUpdate}
            onClose={() => setShowBgSettings(false)}
          />
        )}
      </div>
    </div>
  )
}
