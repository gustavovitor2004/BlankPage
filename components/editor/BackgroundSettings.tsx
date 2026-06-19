'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  storyId: string
  userId: string
  currentUrl: string | null
  opacity: number
  blur: number
  onUpdate: (url: string | null, opacity: number, blur: number) => void
  onClose: () => void
}

export default function BackgroundSettings({
  storyId, userId, currentUrl, opacity, blur, onUpdate, onClose,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [localOpacity, setLocalOpacity] = useState(opacity)
  const [localBlur, setLocalBlur] = useState(blur)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Imagem muito grande (máx. 10MB)'); return }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${storyId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('backgrounds').upload(path, file, { upsert: true })
    if (error) { toast.error('Erro no upload'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('backgrounds').getPublicUrl(path)
    onUpdate(publicUrl, localOpacity, localBlur)
    setUploading(false)
    toast.success('Imagem de fundo definida')
  }

  function handleOpacityChange(val: number) {
    setLocalOpacity(val)
    if (currentUrl) onUpdate(currentUrl, val, localBlur)
  }

  function handleBlurChange(val: number) {
    setLocalBlur(val)
    if (currentUrl) onUpdate(currentUrl, localOpacity, val)
  }

  function handleRemove() {
    onUpdate(null, localOpacity, localBlur)
    toast.success('Imagem de fundo removida')
  }

  return (
    <div
      className="w-72 border-l flex flex-col"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Fundo</span>
        <button onClick={onClose} style={{ color: 'var(--text-3)' }}>
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-auto">
        {/* Current background preview */}
        {currentUrl && (
          <div>
            <div
              className="w-full h-32 rounded-xl bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: `url(${currentUrl})` }}
            >
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
                title="Remover imagem"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Upload button */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
            style={{
              border: '1.5px dashed var(--border-2)',
              color: 'var(--text-3)',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Upload size={14} />
            {uploading ? 'Enviando…' : currentUrl ? 'Trocar imagem' : 'Enviar imagem'}
          </button>
        </div>

        {/* Opacity slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
              Opacidade
            </label>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {Math.round(localOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={localOpacity}
            onChange={e => handleOpacityChange(Number(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: 'var(--text)' }}
          />
        </div>

        {/* Blur slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
              Desfoque
            </label>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {localBlur}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={localBlur}
            onChange={e => handleBlurChange(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--text)' }}
          />
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
          A imagem aparece atrás do texto enquanto você escreve. Ajuste a opacidade e o desfoque para não atrapalhar a leitura.
        </p>
      </div>
    </div>
  )
}
