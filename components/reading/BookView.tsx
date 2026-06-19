'use client'

import { useEffect, useState } from 'react'
import { Story, Chapter } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  story: Story
  chapters: Chapter[]
  isDark: boolean
}

interface Page {
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

// Splits HTML into pages that fit within the fixed book page height.
// Uses a hidden DOM probe with the same styles as .book-page to measure
// actual pixel heights, so the split is always accurate regardless of
// element type (paragraph, heading, blockquote, etc.).
function splitIntoPages(html: string): string[] {
  const source = document.createElement('div')
  source.innerHTML = html
  const elements = Array.from(source.children)
  if (elements.length === 0) return ['<p></p>']

  // Probe mirrors .book-page: same width (450px page including padding),
  // same font, same styles. scrollHeight will include the 88px of vertical
  // padding (3rem top + 2.5rem bottom), so MAX_HEIGHT = 720 - 24 = 696
  // (720 fixed book height minus 1.5rem reserved for page number).
  const probe = document.createElement('div')
  probe.className = 'book-page'
  probe.style.cssText =
    'position:fixed;top:-99999px;left:0;width:450px;height:auto;overflow:visible;visibility:hidden;pointer-events:none;'
  document.body.appendChild(probe)

  const MAX_HEIGHT = 696

  const pages: string[] = []
  let current = ''

  for (const el of elements) {
    const candidate = current + el.outerHTML
    probe.innerHTML = candidate

    if (probe.scrollHeight > MAX_HEIGHT && current) {
      pages.push(current)
      current = el.outerHTML
    } else {
      current = candidate
    }
  }

  if (current) pages.push(current)
  document.body.removeChild(probe)

  return pages.length > 0 ? pages : ['<p></p>']
}

function buildPages(story: Story, chapters: Chapter[]): Page[] {
  const result: Page[] = []

  // Title page
  result.push({
    html: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
      <div style="font-size:0.7em;letter-spacing:0.2em;opacity:0.5;margin-bottom:2rem;text-transform:uppercase;">— obra —</div>
      <div style="font-size:2.2em;font-family:var(--font-cormorant),Georgia,serif;font-weight:300;line-height:1.2;margin-bottom:1rem;">${story.title}</div>
    </div>`,
  })

  for (const chapter of chapters) {
    const bodyHtml = tiptapJsonToHtml(chapter.content || {})
    if (!bodyHtml.trim()) continue

    // Prepend chapter title as the first element so splitIntoPages accounts
    // for its height when deciding where the first page break goes.
    const titleHtml = `<h3 style="font-family:var(--font-cormorant),Georgia,serif;font-size:1.15em;letter-spacing:0.05em;margin-bottom:2rem;opacity:0.7;">${chapter.title}</h3>`
    const chapterPages = splitIntoPages(titleHtml + bodyHtml)

    for (const pageHtml of chapterPages) {
      result.push({ html: pageHtml })
    }
  }

  return result
}

export default function BookView({ story, chapters, isDark }: Props) {
  const [spread, setSpread] = useState(0)
  const [pages, setPages] = useState<Page[]>([])

  // Compute pages only on the client (requires DOM measurement).
  useEffect(() => {
    setSpread(0)
    setPages(buildPages(story, chapters))
  }, [story, chapters])

  const totalSpreads = Math.ceil(pages.length / 2)
  const leftPage = pages[spread * 2]
  const rightPage = pages[spread * 2 + 1]

  const pageColor = isDark ? '#1E1C18' : '#FDFCF6'
  const textColor = isDark ? '#E8E4D8' : '#1C1917'
  const spineColor = isDark ? '#3A3628' : '#D6C9A8'
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
            style={{ background: pageColor, color: textColor, borderRightColor: spineColor }}
          >
            <div className="book-page-content">
              {leftPage ? (
                <div dangerouslySetInnerHTML={{ __html: leftPage.html }} />
              ) : (
                <div style={{ opacity: 0.2, fontStyle: 'italic' }}>— fim —</div>
              )}
            </div>
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
            style={{ background: pageColor, color: textColor }}
          >
            <div className="book-page-content">
              {rightPage ? (
                <div dangerouslySetInnerHTML={{ __html: rightPage.html }} />
              ) : (
                <div style={{ opacity: 0 }} aria-hidden />
              )}
            </div>
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
