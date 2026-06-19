'use client'

import { useMemo, useState } from 'react'
import { Story, Chapter } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  story: Story
  chapters: Chapter[]
  isDark: boolean
}

interface Page {
  chapterTitle?: string
  html: string
}

function tiptapJsonToHtml(json: Record<string, unknown>): string {
  if (!json || !json.content) return ''
  const nodes = json.content as Array<Record<string, unknown>>

  function renderNode(node: Record<string, unknown>): string {
    const children = node.content
      ? (node.content as Array<Record<string, unknown>>).map(renderNode).join('')
      : ''

    const marks = (node.marks || []) as Array<Record<string, unknown>>
    let text = (node.text as string) || ''

    for (const mark of marks) {
      if (mark.type === 'bold') text = `<strong>${text}</strong>`
      if (mark.type === 'italic') text = `<em>${text}</em>`
      if (mark.type === 'underline') text = `<u>${text}</u>`
    }

    switch (node.type) {
      case 'text': return text
      case 'paragraph': {
        const attrs = (node.attrs || {}) as Record<string, unknown>
        const align = attrs.textAlign ? ` style="text-align:${attrs.textAlign}"` : ''
        return `<p${align}>${children}</p>`
      }
      case 'heading': {
        const attrs = (node.attrs || {}) as Record<string, unknown>
        const level = attrs.level || 2
        return `<h${level}>${children}</h${level}>`
      }
      case 'blockquote': return `<blockquote>${children}</blockquote>`
      case 'bulletList': return `<ul>${children}</ul>`
      case 'orderedList': return `<ol>${children}</ol>`
      case 'listItem': return `<li>${children}</li>`
      case 'horizontalRule': return '<hr/>'
      case 'hardBreak': return '<br/>'
      case 'mention': {
        const attrs = (node.attrs || {}) as Record<string, unknown>
        return (attrs.label as string) || ''
      }
      default: return children
    }
  }

  return nodes.map(renderNode).join('')
}

function splitIntoPages(html: string, targetWords = 300): string[] {
  if (typeof document === 'undefined') return [html]
  const div = document.createElement('div')
  div.innerHTML = html
  const elements = Array.from(div.children)

  const pages: string[] = []
  let current = ''
  let words = 0

  for (const el of elements) {
    const elWords = (el.textContent || '').split(/\s+/).filter(Boolean).length
    if (words + elWords > targetWords && current) {
      pages.push(current)
      current = el.outerHTML
      words = elWords
    } else {
      current += el.outerHTML
      words += elWords
    }
  }

  if (current) pages.push(current)
  if (pages.length === 0) pages.push('<p></p>')

  return pages
}

export default function BookView({ story, chapters, isDark }: Props) {
  const [spread, setSpread] = useState(0)

  const pages: Page[] = useMemo(() => {
    const result: Page[] = []

    // Title page
    result.push({
      chapterTitle: undefined,
      html: `<div class="title-page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
        <div style="font-size:0.7em;letter-spacing:0.2em;opacity:0.5;margin-bottom:2rem;text-transform:uppercase;">— obra —</div>
        <div style="font-size:2.2em;font-family:var(--font-cormorant),Georgia,serif;font-weight:300;line-height:1.2;margin-bottom:1rem;">${story.title}</div>
      </div>`,
    })

    for (const chapter of chapters) {
      const html = tiptapJsonToHtml(chapter.content || {})
      if (!html.trim()) continue

      const chapterPages = splitIntoPages(html)
      chapterPages.forEach((pageHtml, i) => {
        result.push({
          chapterTitle: i === 0 ? chapter.title : undefined,
          html: i === 0
            ? `<h3 style="font-family:var(--font-cormorant),Georgia,serif;font-size:1.15em;letter-spacing:0.05em;margin-bottom:2rem;opacity:0.7;">${chapter.title}</h3>${pageHtml}`
            : pageHtml,
        })
      })
    }

    return result
  }, [story, chapters])

  const totalSpreads = Math.ceil(pages.length / 2)
  const leftPage = pages[spread * 2]
  const rightPage = pages[spread * 2 + 1]

  const pageColor = isDark ? '#1E1C18' : '#FDFCF6'
  const textColor = isDark ? '#E8E4D8' : '#1C1917'
  const spineColor = isDark ? '#3A3628' : '#D6C9A8'
  const coverColor = isDark ? '#111110' : '#E8E2D5'
  const shadowLight = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.18)'

  return (
    <div className="animate-fade-in">
      {/* Book container */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: 900,
          filter: `drop-shadow(0 20px 60px ${shadowLight})`,
        }}
      >
        {/* Spine effect */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 z-10"
          style={{ background: `linear-gradient(to right, ${spineColor}, ${pageColor} 30%, ${pageColor} 70%, ${spineColor})` }}
        />

        <div className="book-spread rounded-lg overflow-hidden" style={{ boxShadow: `0 2px 40px ${shadowLight}` }}>
          {/* Left page */}
          <div
            className="book-page book-page-left"
            style={{
              background: pageColor,
              color: textColor,
              borderRightColor: spineColor,
              minHeight: 560,
            }}
          >
            {leftPage ? (
              <div dangerouslySetInnerHTML={{ __html: leftPage.html }} />
            ) : (
              <div style={{ opacity: 0.2, fontStyle: 'italic' }}>— fim —</div>
            )}

            {/* Page number */}
            <div
              className="absolute bottom-4 left-6 text-xs"
              style={{ color: textColor, opacity: 0.35, fontFamily: 'var(--font-lora),Georgia,serif' }}
            >
              {spread * 2 + 1}
            </div>
          </div>

          {/* Right page */}
          <div
            className="book-page book-page-right"
            style={{
              background: pageColor,
              color: textColor,
              minHeight: 560,
            }}
          >
            {rightPage ? (
              <div dangerouslySetInnerHTML={{ __html: rightPage.html }} />
            ) : (
              <div style={{ opacity: 0 }} aria-hidden />
            )}

            {rightPage && (
              <div
                className="absolute bottom-4 right-6 text-xs"
                style={{ color: textColor, opacity: 0.35, fontFamily: 'var(--font-lora),Georgia,serif' }}
              >
                {spread * 2 + 2}
              </div>
            )}
          </div>
        </div>

        {/* Outer book cover edges */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${spineColor}22`,
          }}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => setSpread(s => Math.max(0, s - 1))}
          disabled={spread === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-30"
          style={{ color: textColor, background: pageColor }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <span className="text-sm" style={{ color: isDark ? '#8B857A' : '#6B6159' }}>
          {spread + 1} / {totalSpreads}
        </span>

        <button
          onClick={() => setSpread(s => Math.min(totalSpreads - 1, s + 1))}
          disabled={spread >= totalSpreads - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-30"
          style={{ color: textColor, background: pageColor }}
        >
          Próxima
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
