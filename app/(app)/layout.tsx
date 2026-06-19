'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Toaster position="top-center" />
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Toaster position="top-center" />
      {children}
    </div>
  )
}
