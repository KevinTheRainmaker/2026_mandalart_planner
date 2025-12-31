import { create } from 'zustand'
import type { Mandala } from '@/types'

interface MandalaState {
  mandala: Mandala | null
  isLoading: boolean
  error: string | null

  // Actions
  setMandala: (mandala: Mandala | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateProgress: (currentDay: number, completedDays: number[]) => void
}

export const useMandalaStore = create<MandalaState>((set) => ({
  mandala: null,
  isLoading: false,
  error: null,

  setMandala: (mandala) => set({ mandala }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  updateProgress: (currentDay, completedDays) =>
    set((state) => ({
      mandala: state.mandala
        ? { ...state.mandala, current_day: currentDay, completed_days: completedDays }
        : null,
    })),
}))
