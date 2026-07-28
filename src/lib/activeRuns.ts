/**
 * Shared in-process state for the meeting simulation loop.
 *
 * activeRuns       — meetingId → true while a run loop is executing.
 * pendingPause     — meetingId is present when a pause has been requested;
 *                    the run loop checks this between turns and pauses cleanly.
 * pendingDirective — steer directive to inject on the next resume.
 *
 * Stored on `global` so the same Map/Set instances survive Next.js HMR
 * module re-evaluation in development. Without this, the run loop (which
 * holds a reference to the original Set) and the pause route (which imports
 * a freshly re-evaluated Set) would never share state.
 */

const g = global as typeof globalThis & {
  _activeRuns?: Map<string, boolean>
  _pendingPause?: Set<string>
  _pendingDirective?: Map<string, string>
}

export const activeRuns: Map<string, boolean> =
  g._activeRuns ?? (g._activeRuns = new Map())

export const pendingPause: Set<string> =
  g._pendingPause ?? (g._pendingPause = new Set())

export const pendingDirective: Map<string, string> =
  g._pendingDirective ?? (g._pendingDirective = new Map())
