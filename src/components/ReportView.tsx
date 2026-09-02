import { ReactNode } from 'react'
import { Report } from '@/types'
import ReactMarkdown from 'react-markdown'

interface Props {
  report: Report
}

const SECTION_CONFIG: {
  key: keyof Pick<Report, 'keyDecisions' | 'actionItems' | 'openQuestions' | 'dissents'>
  title: string
  accent: string
  icon: ReactNode
}[] = [
  {
    key: 'keyDecisions',
    title: 'Key Decisions',
    accent: '#7c6af7',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    key: 'actionItems',
    title: 'Action Items',
    accent: '#10b981',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  },
  {
    key: 'openQuestions',
    title: 'Open Questions',
    accent: '#f59e0b',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    key: 'dissents',
    title: 'Notable Dissents',
    accent: '#ef4444',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export default function ReportView({ report }: Props) {
  return (
    <div>
      {/* At-a-glance stat bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {SECTION_CONFIG.map(({ key, title, accent }) => (
          <div
            key={key}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            style={{ borderColor: accent, color: accent }}
          >
            <span className="font-bold text-lg leading-none">{report[key].length}</span>
            <span>{title}</span>
          </div>
        ))}
      </div>

      {/* Executive Summary */}
      <div
        className="rounded-xl border p-5 mb-4 border-l-[3px]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: 'var(--accent)' }}
      >
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Executive Summary
        </h3>
        <div className="prose-report text-sm leading-relaxed">
          <ReactMarkdown>{report.executiveSummary}</ReactMarkdown>
        </div>
      </div>

      {/* Section cards */}
      {SECTION_CONFIG.map(({ key, title, accent, icon }) => (
        <div
          key={key}
          className="rounded-xl border p-5 mb-4 border-l-[3px]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: accent }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm" style={{ color: accent }}>
            {icon}
            {title}
          </h3>
          {report[key].length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>None identified.</p>
          ) : (
            <ul className="space-y-2">
              {report[key].map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start p-3 rounded-lg text-sm"
                  style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="prose-inline flex-1">
                    <ReactMarkdown>{item}</ReactMarkdown>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
