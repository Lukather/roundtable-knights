import type { Metadata } from 'next'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Roundtable Knights',
  description: 'AI-powered roundtable discussions with synthetic personas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Runs before paint — prevents flash of wrong theme */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t||'dark';})()` }} />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-2xl">⚔️</span>
              <span>Roundtable Knights</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/personas" className="transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>
                Personas
              </a>
              <a
                href="/meetings/new"
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
                style={{ background: 'var(--accent)' }}
              >
                New Meeting
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
