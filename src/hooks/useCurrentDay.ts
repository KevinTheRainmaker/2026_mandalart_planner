import { useMemo } from 'react'
import { validateDay } from '@/utils/validators'
import type { Mandala, DayNumber } from '@/types'

/**
 * Hook to get current day information
 */
export function useCurrentDay(mandala: Mandala | null) {
  return useMemo(() => {
    if (!mandala) {
      return {
        currentDay: 1 as DayNumber,
        completedDays: [],
        isCompleted: false,
        canAccessDay: (day: number) => day === 1,
      }
    }

    const currentDay = (mandala.current_day || 1) as DayNumber
    const completedDays = mandala.completed_days || []
    const isCompleted = completedDays.length === 14

    const canAccessDay = (day: number): boolean => {
      if (!validateDay(day)) return false

      // Day 1 is always accessible
      if (day === 1) return true

      // Can access current day
      if (day === currentDay) return true

      // Can access completed days
      if (completedDays.includes(day)) return true

      // Can access next day if previous day is completed
      if (day === currentDay + 1 && completedDays.includes(currentDay)) {
        return true
      }

      return false
    }

    return {
      currentDay,
      completedDays,
      isCompleted,
      canAccessDay,
    }
  }, [mandala])
}
