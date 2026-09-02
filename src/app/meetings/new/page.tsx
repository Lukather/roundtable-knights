import MeetingSetupForm from '@/components/MeetingSetupForm'

export default function NewMeetingPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">New Meeting</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
          Stage a multi-voice debate. Define the question, cast your voices, and let them argue.
        </p>
      </div>
      <MeetingSetupForm />
    </div>
  )
}
