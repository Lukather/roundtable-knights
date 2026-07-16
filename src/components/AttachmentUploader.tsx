'use client'

import { useState, useRef } from 'react'
import { Attachment } from '@/types'

interface Props {
  meetingId: string
  attachments: Attachment[]
  onAdd: (a: Attachment) => void
  onRemove: (id: string) => void
}

export default function AttachmentUploader({ meetingId, attachments, onAdd, onRemove }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('meetingId', meetingId)
      const res = await fetch('/api/attachments', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const attachment: Attachment = await res.json()
      onAdd(attachment)
    } catch (err) {
      setError(String(err))
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
    onRemove(id)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
        style={{ borderColor: 'var(--border)' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {uploading ? 'Uploading…' : 'Drop a file here or click to browse'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>PDF, DOCX, TXT, MD</p>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {attachments.length > 0 && (
        <ul className="mt-3 space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              <span className="truncate" style={{ color: 'var(--foreground)' }}>{a.filename}</span>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span style={{ color: 'var(--muted)' }}>{formatSize(a.sizeBytes)}</span>
                <button
                  onClick={() => handleRemove(a.id)}
                  className="text-xs transition-colors hover:text-red-400"
                  style={{ color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
