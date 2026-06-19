'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Aplica tema salvo antes de renderizar
    const saved = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.toggle('dark', saved === 'dark')

    // Escuta mudanças de autenticação em tempo real
    // Se a sessão expirar ou o usuário for deletado/deslogado, redireciona imediatamente
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Toaster position="top-center" />
      {children}
    </div>
  )
}
