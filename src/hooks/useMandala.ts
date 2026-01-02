import { useEffect, useCallback } from 'react'
import { useMandalaStore } from '@/store'
import { getMandala, updateMandala as updateMandalaApi } from '@/lib/api'
import type { MandalaUpdate } from '@/types'

/**
 * Hook to manage Mandala data
 */
export function useMandala(userId: string | undefined, year: number = 2026) {
  const { mandala, isLoading, error, setMandala, setLoading, setError } =
    useMandalaStore()

  // Load mandala data
  const loadMandala = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getMandala(userId, year)
      setMandala(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mandala')
    } finally {
      setLoading(false)
    }
  }, [userId, year]) // Zustand actions are stable, no need to include them

  // Update mandala
  const updateMandala = useCallback(
    async (updates: MandalaUpdate) => {
      if (!mandala?.id) return

      setLoading(true)
      setError(null)

      try {
        const updated = await updateMandalaApi(mandala.id, updates)
        if (updated) {
          setMandala(updated)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update mandala')
      } finally {
        setLoading(false)
      }
    },
    [mandala?.id] // Zustand actions are stable, no need to include them
  )

  // Load mandala on mount
  useEffect(() => {
    loadMandala()
  }, [loadMandala])

  return {
    mandala,
    isLoading,
    error,
    loadMandala,
    updateMandala,
  }
}
