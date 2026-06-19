export interface Story {
  id: string
  user_id: string
  title: string
  description: string | null
  cover_image_url: string | null
  background_image_url: string | null
  background_opacity: number
  background_blur: number
  created_at: string
  updated_at: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  story_id: string
  user_id: string
  title: string
  content: Record<string, unknown>
  content_text: string
  order_index: number
  background_image_url: string | null
  background_opacity: number
  background_blur: number
  created_at: string
  updated_at: string
}

export interface StoryWord {
  id: string
  story_id: string
  user_id: string
  word: string
  shortcut: string | null
  created_at: string
}

export interface UserSettings {
  user_id: string
  theme: 'light' | 'dark'
  editor_font: string
  editor_font_size: number
  editor_line_height: number
  editor_paragraph_spacing: number
}

export const EDITOR_FONTS: { name: string; label: string; variable: string }[] = [
  { name: 'Lora', label: 'Lora', variable: 'var(--font-lora)' },
  { name: 'Cormorant Garamond', label: 'Cormorant Garamond', variable: 'var(--font-cormorant)' },
  { name: 'Playfair Display', label: 'Playfair Display', variable: 'var(--font-playfair)' },
  { name: 'EB Garamond', label: 'EB Garamond', variable: 'var(--font-garamond)' },
  { name: 'Crimson Text', label: 'Crimson Text', variable: 'var(--font-crimson)' },
  { name: 'Source Serif 4', label: 'Source Serif 4', variable: 'var(--font-source-serif)' },
]
