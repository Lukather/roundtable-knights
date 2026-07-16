'use client'

import { create } from 'zustand'
import { Turn, Meeting } from '@/types'

interface MeetingState {
  turns: Turn[]
  status: Meeting['status']
  isGeneratingReport: boolean
  addTurn: (turn: Turn) => void
  setTurns: (turns: Turn[]) => void
  setStatus: (status: Meeting['status']) => void
  setGeneratingReport: (val: boolean) => void
  reset: () => void
}

export const useMeetingStore = create<MeetingState>((set) => ({
  turns: [],
  status: 'idle',
  isGeneratingReport: false,
  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  setTurns: (turns) => set({ turns }),
  setStatus: (status) => set({ status }),
  setGeneratingReport: (val) => set({ isGeneratingReport: val }),
  reset: () => set({ turns: [], status: 'idle', isGeneratingReport: false }),
}))
