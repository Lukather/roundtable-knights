'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Report, Meeting, Persona } from '@/types'
import ReportView from '@/components/ReportView'
import Link from 'next/link'
import { getInitials, avatarColor } from '@/lib/avatarUtils'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<Report | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/meetings/${id}/report`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/meetings/${id}`).then((r) => r.ok ? r.json() : null),
      fetch('/api/personas').then((r) => r.ok ? r.json() : []),
    ])
      .then(([r, m, ps]) => { setReport(r); setMeeting(m); setPersonas(ps ?? []) })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [id])

  function handleExport() {
    if (!report) return
    const blob = new Blob([report.rawMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${id}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    if (!report) return
    await navigator.clipboard.writeText(report.rawMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Loading report…</div>
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>
  if (!report) return (
    <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
      <p className="mb-4">No report yet.</p>
      <Link href={`/meetings/${id}`} className="underline" style={{ color: 'var(--accent)' }}>Back to meeting</Link>
    </div>
  )

  const participantPersonas = meeting
    ? (meeting.personaIds ?? []).map((pid) => personas.find((p) => p.id === pid)).filter(Boolean) as Persona[]
    : []

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/meetings/${id}`} className="text-sm transition-colors hover:text-white mb-3 inline-block" style={{ color: 'var(--muted)' }}>
          ← Back to discussion
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Meeting Report</h1>
            {meeting && (
              <>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{meeting.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(meeting.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm border transition-colors hover:border-purple-500 flex items-center gap-1.5"
              style={{ borderColor: 'var(--border)', color: copied ? 'var(--accent)' : 'var(--muted)' }}
            >
              {copied ? '✓ Copied' : 'Copy MD'}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-sm border transition-colors hover:border-purple-500"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Export .md
            </button>
          </div>
        </div>

        {/* Participant chips */}
        {participantPersonas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {participantPersonas.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(p.id)}`}>
                  {getInitials(p.name)}
                </span>
                <span className="font-medium">{p.name}</span>
                <span style={{ color: 'var(--muted)' }}>· {p.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportView report={report} />
    </div>
  )
}
