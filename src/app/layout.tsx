import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

const fredoka = Fredoka({ subsets: ['latin'], weight: '700', variable: '--font-wordmark' })

export const metadata: Metadata = {
  title: 'Crucible',
  description: 'Stage a multi-voice AI debate. Stress-test your decisions before the real meeting.',
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
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              {/* Crucible hex mark — seven-cell cluster, the cast converging into one */}
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 32, height: 32, flexShrink: 0 }}
                aria-hidden="true"
              >
                <polygon points="32.0,24.26 38.7,28.13 38.7,35.87 32.0,39.74 25.3,35.87 25.3,28.13" fill="#7c6af7" />
                <polygon points="46.9,24.26 53.6,28.13 53.6,35.87 46.9,39.74 40.19,35.87 40.19,28.13" fill="#7c6af7" />
                <polygon points="39.45,37.16 46.15,41.03 46.15,48.77 39.45,52.64 32.74,48.77 32.74,41.03" fill="#7c6af7" />
                <polygon points="24.55,37.16 31.26,41.03 31.26,48.77 24.55,52.64 17.85,48.77 17.85,41.03" fill="#7c6af7" />
                <polygon points="17.1,24.26 23.81,28.13 23.81,35.87 17.1,39.74 10.4,35.87 10.4,28.13" fill="#7c6af7" />
                <polygon points="24.55,11.36 31.26,15.23 31.26,22.97 24.55,26.84 17.85,22.97 17.85,15.23" fill="#7c6af7" />
                <polygon points="39.45,11.36 46.15,15.23 46.15,22.97 39.45,26.84 32.74,22.97 32.74,15.23" fill="#7c6af7" />
              </svg>
              {/* Wordmark */}
              <span className={fredoka.className} style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
                lineHeight: 1,
              }}>
                Crucible
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/personas" className="transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Personas</a>
              <a href="/meetings" className="transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Meetings</a>
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
