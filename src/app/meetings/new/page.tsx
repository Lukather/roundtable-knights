import MeetingSetupForm from '@/components/MeetingSetupForm'

export default function NewMeetingPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Meeting</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Set up a roundtable discussion with your synthetic personas.
        </p>
      </div>
      <MeetingSetupForm />
    </div>
  )
}
