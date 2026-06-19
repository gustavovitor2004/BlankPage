'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
import { buildSuggestion } from './suggestion'
import { EDITOR_FONTS } from '@/lib/types'

interface Props {
  initialContent: Record<string, unknown>
  onChange: (json: Record<string, unknown>, text: string) => void
  font: string
  fontSize: number
  lineHeight: number
  suggestions: string[]
}

// Map font name → CSS font-family value
function getFontFamily(name: string): string {
  const found = EDITOR_FONTS.find(f => f.name === name)
  return found ? found.variable : `"${name}", Georgia, serif`
}

export default function RichEditor({
  initialContent,
  onChange,
  font,
  fontSize,
  lineHeight,
  suggestions,
}: Props) {
  const suggestionsRef = useRef(suggestions)
  suggestionsRef.current = suggestions

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Typography,
      TextStyle,
      Color,
      FontFamily,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Comece a escrever sua história…',
      }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        renderText({ node }) {
          return node.attrs.label as string
        },
        suggestion: buildSuggestion(() => suggestionsRef.current),
      }),
    ],
    content: initialContent && Object.keys(initialContent).length > 0
      ? initialContent
      : { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate({ editor }) {
      const json = editor.getJSON() as Record<string, unknown>
      const text = editor.getText()
      onChange(json, text)
    },
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        spellcheck: 'true',
      },
    },
    immediatelyRender: false,
  })

  // Expose editor to toolbar via window for simplicity
  useEffect(() => {
    if (editor) {
      (window as unknown as Record<string, unknown>).__tiptap_editor = editor
    }
  }, [editor])

  return (
    <div
      style={{
        fontFamily: getFontFamily(font),
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        color: 'var(--text)',
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
