import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function extractNames(text: string): string[] {
  const matches = text.match(/\b[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑÜ][a-záàâãéèêíïóôõöúçñü]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑÜ][a-záàâãéèêíïóôõöúçñü]+)*/g) || []
  return Array.from(new Set(matches)).sort()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

export function tiptapJsonToText(json: Record<string, unknown>): string {
  if (!json || !json.content) return ''
  const content = json.content as Array<Record<string, unknown>>

  function extractText(node: Record<string, unknown>): string {
    if (node.type === 'text') return (node.text as string) || ''
    if (node.content) {
      return (node.content as Array<Record<string, unknown>>)
        .map(extractText)
        .join('')
    }
    return ''
  }

  return content.map(extractText).join('\n')
}
