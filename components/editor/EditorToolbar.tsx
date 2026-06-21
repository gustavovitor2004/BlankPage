'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Download,
  ChevronDown, Minus, Plus,
} from 'lucide-react'
import { EDITOR_FONTS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  font: string
  fontSize: number
  lineHeight: number
  paraSpacing: number
  userId: string
  onFontChange: (f: string) => void
  onFontSizeChange: (s: number) => void
  onLineHeightChange: (h: number) => void
  onParaSpacingChange: (p: number) => void
  storyId: string
  chapterId: string
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md transition-all text-sm"
      style={{
        background: active ? 'var(--surface-2)' : 'transparent',
        // Cores explícitas em vez de opacity: evita que a opacidade herde para os ícones filhos
        color: active ? 'var(--text)' : 'var(--text-3)',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-3)' }}
    >
      {children}
    </button>
  )
}

export default function EditorToolbar({
  font, fontSize, lineHeight, paraSpacing, userId,
  onFontChange, onFontSizeChange, onLineHeightChange, onParaSpacingChange,
  storyId, chapterId,
}: Props) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [, forceUpdate] = useState(0)
  const [showFontMenu, setShowFontMenu] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const e = (window as unknown as Record<string, unknown>).__tiptap_editor as Editor | undefined
      if (e && !editor) {
        setEditor(e)
        e.on('selectionUpdate', () => forceUpdate(n => n + 1))
        e.on('transaction', () => forceUpdate(n => n + 1))
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [editor])

  // Salva configurações globais no Supabase
  async function saveUserSettings(updates: Record<string, unknown>) {
    const supabase = createClient()
    await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
  }

  // Fonte: aplica na seleção OU em todo o texto
  function handleFontSelect(fontName: string, fontVar: string) {
    if (!editor) return
    setShowFontMenu(false)

    const hasSelection = !editor.state.selection.empty

    if (hasSelection) {
      // Apenas na seleção — não altera o padrão global
      editor.chain().focus().setFontFamily(fontVar).run()
    } else {
      // Sem seleção: aplica em todo o texto e salva como padrão global
      const docEnd = editor.state.doc.content.size
      editor.chain().focus().selectAll().setFontFamily(fontVar).run()
      editor.commands.setTextSelection(docEnd)
      onFontChange(fontName)
      saveUserSettings({ editor_font: fontName })
    }
  }

  // Tamanho: aplica na seleção OU atualiza o padrão global
  function handleFontSizeChange(newSize: number) {
    if (!editor) return
    const clamped = Math.min(72, Math.max(10, newSize))

    const hasSelection = !editor.state.selection.empty

    if (hasSelection) {
      // Apenas na seleção — marca inline com o tamanho
      editor.chain().focus().setFontSize(clamped).run()
    } else {
      // Sem seleção: atualiza o padrão global (CSS wrapper) e salva no DB
      onFontSizeChange(clamped)
      saveUserSettings({ editor_font_size: clamped })
    }
  }

  // Espaçamento entre linhas — sempre global
  function handleLineHeightChange(val: number) {
    onLineHeightChange(val)
    saveUserSettings({ editor_line_height: val })
  }

  // Espaçamento entre parágrafos — sempre global
  function handleParaSpacingChange(val: number) {
    onParaSpacingChange(val)
    saveUserSettings({ editor_paragraph_spacing: val })
  }

  const handleExport = useCallback(async () => {
    if (!editor) return
    const { default: TurndownService } = await import('turndown')
    const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
    const markdown = td.turndown(editor.getHTML())
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capitulo-${chapterId.slice(0, 8)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [editor, chapterId])

  if (!editor) return <div className="border-b h-10" style={{ borderColor: 'var(--border)' }} />

  // Detecta fonte e tamanho ativos na seleção atual
  const selAttrs = editor.getAttributes('textStyle')
  const selFontVar = selAttrs.fontFamily as string | undefined
  const selFontSize = selAttrs.fontSize as number | undefined
  const hasSelection = !editor.state.selection.empty

  const activeFontName = selFontVar
    ? (EDITOR_FONTS.find(f => f.variable === selFontVar)?.name ?? font)
    : font
  const displayFontSize = hasSelection && selFontSize ? Number(selFontSize) : fontSize

  const sep = <div className="w-px h-5 mx-1 self-center" style={{ background: 'var(--border)' }} />

  return (
    <div
      className="border-b flex items-center flex-wrap gap-0.5 px-4 py-1.5 sticky top-12 z-20"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)', backdropFilter: 'blur(8px)' }}
    >
      {/* Font selector */}
      <div className="relative">
        <button
          onClick={() => setShowFontMenu(!showFontMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
          style={{
            color: 'var(--text-2)',
            background: 'var(--surface)',
            fontFamily: EDITOR_FONTS.find(f => f.name === activeFontName)?.variable ?? 'Georgia, serif',
          }}
          title={hasSelection ? 'Fonte da seleção' : 'Fonte global (sem seleção = aplica em todo o texto)'}
        >
          <span style={{ fontSize: '0.85rem' }}>{activeFontName.split(' ')[0]}</span>
          <ChevronDown size={12} />
        </button>
        {showFontMenu && (
          <div
            className="absolute top-8 left-0 rounded-xl py-1.5 z-50 min-w-48"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
          >
            {/* Indicador de modo */}
            <p className="px-4 pb-1 text-xs" style={{ color: 'var(--text-3)' }}>
              {hasSelection ? '→ Aplica na seleção' : '→ Aplica em todo o texto'}
            </p>
            {EDITOR_FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => handleFontSelect(f.name, f.variable)}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  fontFamily: f.variable,
                  color: 'var(--text)',
                  background: activeFontName === f.name ? 'var(--surface-2)' : 'transparent',
                  fontSize: '1rem',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sep}

      {/* Font size */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => handleFontSizeChange(displayFontSize - 1)}
          className="p-1 rounded opacity-50 hover:opacity-80"
          style={{ color: 'var(--text)' }}
          title={hasSelection ? 'Diminuir tamanho da seleção' : 'Diminuir tamanho global'}
        >
          <Minus size={13} />
        </button>
        <span
          className="text-xs w-7 text-center tabular-nums"
          style={{ color: hasSelection && selFontSize ? 'var(--text)' : 'var(--text-2)' }}
          title={hasSelection && selFontSize ? 'Tamanho da seleção' : 'Tamanho padrão'}
        >
          {displayFontSize}
        </span>
        <button
          onClick={() => handleFontSizeChange(displayFontSize + 1)}
          className="p-1 rounded opacity-50 hover:opacity-80"
          style={{ color: 'var(--text)' }}
          title={hasSelection ? 'Aumentar tamanho da seleção' : 'Aumentar tamanho global'}
        >
          <Plus size={13} />
        </button>
      </div>

      {sep}

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)">
        <Underline size={15} />
      </ToolbarButton>

      {sep}

      {/* Headings */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1">
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2">
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3">
        <Heading3 size={15} />
      </ToolbarButton>

      {sep}

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Esquerda">
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centro">
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Direita">
        <AlignRight size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificado">
        <AlignJustify size={15} />
      </ToolbarButton>

      {sep}

      {/* Lists & quote */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
        <Quote size={15} />
      </ToolbarButton>

      {sep}

      {/* Line height — sempre global */}
      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>↕</span>
        <select
          value={lineHeight}
          onChange={e => handleLineHeightChange(Number(e.target.value))}
          className="text-xs rounded px-1 py-0.5 outline-none"
          style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          title="Espaçamento entre linhas (global)"
        >
          {[1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Paragraph spacing — sempre global */}
      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>¶</span>
        <select
          value={paraSpacing}
          onChange={e => handleParaSpacingChange(Number(e.target.value))}
          className="text-xs rounded px-1 py-0.5 outline-none"
          style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          title="Espaçamento entre parágrafos (global)"
        >
          {[8, 12, 16, 20, 24, 32].map(v => (
            <option key={v} value={v}>{v}px</option>
          ))}
        </select>
      </div>

      <div className="flex-1" />

      {/* Export */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
        style={{ color: 'var(--text-3)', background: 'var(--surface)' }}
        title="Exportar como Markdown"
      >
        <Download size={13} />
        .md
      </button>

      {showFontMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowFontMenu(false)} />
      )}
    </div>
  )
}
