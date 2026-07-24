/**
 * Shared in-process state for the meeting simulation loop.
 *
 * activeRuns  — meetingId → true while a run loop is executing.
 * pendingPause — meetingId is present when a pause has been requested;
 *               the run loop checks this between turns and pauses cleanly.
 * pendingDirective — steer directive to inject on the next resume.
 */

export const activeRuns = new Map<string, boolean>()
export const pendingPause = new Set<string>()
export const pendingDirective = new Map<string, string>()
