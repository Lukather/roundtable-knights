'use client'

import { create } from 'zustand'
import { Turn, Meeting } from '@/types'

export interface StreamingTurn {
  id: string
  personaId: string
  kind: 'regular' | 'interjection' | 'moderator'
  content: string
}

export interface SteerState {
  directive: string
  turnsLeft: number
}

interface MeetingState {
  turns: Turn[]
  streamingTurns: Map<string, StreamingTurn>
  status: Meeting['status']
  steer: SteerState | null
  isGeneratingReport: boolean
  addTurn: (turn: Turn) => void
  setTurns: (turns: Turn[]) => void
  setStatus: (status: Meeting['status']) => void
  setSteer: (steer: SteerState | null) => void
  setGeneratingReport: (val: boolean) => void
  startStreamingTurn: (id: string, personaId: string, kind: 'regular' | 'interjection' | 'moderator') => void
  appendToken: (id: string, token: string) => void
  commitTurn: (turn: Turn) => void
  reset: () => void
}

export const useMeetingStore = create<MeetingState>((set) => ({
  turns: [],
  streamingTurns: new Map(),
  status: 'idle',
  steer: null,
  isGeneratingReport: false,

  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  setTurns: (turns) => set({ turns }),
  setStatus: (status) => set({ status }),
  setSteer: (steer) => set({ steer }),
  setGeneratingReport: (val) => set({ isGeneratingReport: val }),

  startStreamingTurn: (id, personaId, kind) =>
    set((state) => {
      const next = new Map(state.streamingTurns)
      next.set(id, { id, personaId, kind, content: '' })
      return { streamingTurns: next }
    }),

  appendToken: (id, token) =>
    set((state) => {
      const existing = state.streamingTurns.get(id)
      if (!existing) return state
      const next = new Map(state.streamingTurns)
      next.set(id, { ...existing, content: existing.content + token })
      return { streamingTurns: next }
    }),

  commitTurn: (turn) =>
    set((state) => {
      const next = new Map(state.streamingTurns)
      next.delete(turn.id)
      // Deduplicate: skip if a turn with this id is already committed (e.g. replayed on resume)
      if (state.turns.some((t) => t.id === turn.id)) return { streamingTurns: next }
      return { turns: [...state.turns, turn], streamingTurns: next }
    }),

  reset: () => set({ turns: [], streamingTurns: new Map(), status: 'idle', steer: null, isGeneratingReport: false }),
}))
