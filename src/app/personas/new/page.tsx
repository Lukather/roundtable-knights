import PersonaForm from '@/components/PersonaForm'

export default function NewPersonaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Persona</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Define a synthetic participant for your roundtable discussions.
        </p>
      </div>
      <PersonaForm mode="create" />
    </div>
  )
}
