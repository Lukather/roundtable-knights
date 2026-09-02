import PersonaForm from '@/components/PersonaForm'
import Link from 'next/link'

export default function NewPersonaPage() {
  return (
    <div>
      <div className="persona-page-head" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="pf-breadcrumb">
            <Link href="/personas" className="pf-breadcrumb-link">Cast roster</Link>
            <span className="pf-breadcrumb-sep">/</span>
            <span>New voice</span>
          </div>
          <h1 className="persona-page-title" style={{ marginTop: '0.375rem' }}>Commission a voice</h1>
          <p className="persona-page-sub">Define a synthetic voice to cast in your Crucible sessions.</p>
        </div>
      </div>
      <PersonaForm mode="create" />
    </div>
  )
}
