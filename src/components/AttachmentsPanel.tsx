'use client'

import { useEffect, useState } from 'react'
import { Attachment } from '@/types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp'])
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'])

function isImageAttachment(a: Attachment): boolean {
  if (IMAGE_MIMES.has(a.mimeType.toLowerCase())) return true
  const ext = a.filename.toLowerCase().split('.').pop() ?? ''
  return IMAGE_EXTS.has(ext)
}

function FileIcon({ mimeType, filename }: { mimeType: string; filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const isPdf = mimeType === 'application/pdf' || ext === 'pdf'
  const isDoc = mimeType.includes('word') || ext === 'docx'
  const isImg = IMAGE_MIMES.has(mimeType) || IMAGE_EXTS.has(ext ?? '')

  if (isImg) {
    return (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8b5cf6' }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  }
  if (isPdf) {
    return (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    )
  }
  if (isDoc) {
    return (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function downloadAttachment(attachment: Attachment) {
  const isImage = isImageAttachment(attachment)
  let url: string
  let filename = attachment.filename

  if (isImage) {
    const byteChars = atob(attachment.extractedText)
    const bytes = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
    url = URL.createObjectURL(new Blob([bytes], { type: attachment.mimeType }))
  } else {
    url = URL.createObjectURL(new Blob([attachment.extractedText], { type: 'text/plain' }))
    // Non-text originals (pdf, docx) get .txt appended so the OS doesn't confuse them
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext && !['txt', 'md', 'csv', 'json'].includes(ext)) {
      filename = filename + '.txt'
    }
  }

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isImage = isImageAttachment(attachment)

  async function handleToggle() {
    if (!open && analysis === null) {
      setOpen(true)
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/attachments/${attachment.id}/summary`, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to analyse')
        const { summary } = await res.json()
        setAnalysis(summary)
      } catch {
        setError('Could not generate analysis.')
      } finally {
        setLoading(false)
      }
    } else {
      setOpen((v) => !v)
    }
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* File row — div role=button: the download control inside can't be a
          nested <button> (invalid HTML, breaks a11y) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:bg-white/5"
      >
        <FileIcon mimeType={attachment.mimeType} filename={attachment.filename} />
        <span className="flex-1 min-w-0 text-sm font-medium text-white truncate">
          {attachment.filename}
        </span>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
          {formatSize(attachment.sizeBytes)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); downloadAttachment(attachment) }}
          title="Download"
          className="flex-shrink-0 p-1 rounded transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
          style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded panel */}
      {open && (
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Image thumbnail */}
          {isImage && (
            <div className="px-4 pt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${attachment.mimeType};base64,${attachment.extractedText}`}
                alt={attachment.filename}
                className="w-full rounded-lg object-contain max-h-64"
                style={{ background: 'var(--surface-2)' }}
              />
            </div>
          )}

          {/* AI analysis */}
          <div className="px-4 pb-4 pt-3 text-sm">
            {loading ? (
              <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {isImage ? 'Analysing image…' : 'Summarising…'}
              </div>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                    {isImage ? 'AI Analysis' : 'AI Summary'}
                  </span>
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>{analysis}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  meetingId: string
}

export default function AttachmentsPanel({ meetingId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}/attachments`)
      .then((r) => r.ok ? r.json() : [])
      .then(setAttachments)
      .catch(() => {})
  }, [meetingId])

  if (attachments.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          {attachments.length} {attachments.length === 1 ? 'Attachment' : 'Attachments'}
        </span>
      </div>
      <div className="space-y-2">
        {attachments.map((a) => (
          <AttachmentCard key={a.id} attachment={a} />
        ))}
      </div>
    </div>
  )
}
