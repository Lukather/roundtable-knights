'use client'

import { useEffect, useState } from 'react'

function SunIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initial = saved ?? 'dark'
    setTheme(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
  }

  const showSun = theme === 'dark'
  // Both icons stay in the DOM; cross-fade with opacity/scale/blur.
  const iconClass =
    'absolute inset-0 w-4 h-4 m-auto transition-[opacity,transform,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)]'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${showSun ? 'light' : 'dark'} mode`}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-[background-color,transform] hover:bg-white/10 active:scale-[0.96]"
      style={{ color: 'var(--muted)' }}
    >
      <SunIcon
        className={iconClass}
        style={{
          opacity: showSun ? 1 : 0,
          transform: showSun ? 'scale(1)' : 'scale(0.25)',
          filter: showSun ? 'blur(0)' : 'blur(4px)',
        }}
      />
      <MoonIcon
        className={iconClass}
        style={{
          opacity: showSun ? 0 : 1,
          transform: showSun ? 'scale(0.25)' : 'scale(1)',
          filter: showSun ? 'blur(4px)' : 'blur(0)',
        }}
      />
    </button>
  )
}
