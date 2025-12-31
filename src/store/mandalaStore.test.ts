import { describe, it, expect, beforeEach } from 'vitest'
import { useMandalaStore } from './mandalaStore'
import type { Mandala } from '@/types'

describe('mandalaStore', () => {
  const mockMandala: Mandala = {
    id: 'mandala-123',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: { q1: 'answer1' },
    reflection_notes: 'notes',
    center_goal: 'My Goal',
    sub_goals: Array(8).fill('sub goal'),
    action_plans: {},
    ai_summary: null,
    current_day: 3,
    completed_days: [1, 2],
    marketing_consent: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    // Reset store before each test
    useMandalaStore.setState({
      mandala: null,
      isLoading: false,
      error: null,
    })
  })

  it('should have initial state', () => {
    const { mandala, isLoading, error } = useMandalaStore.getState()
    expect(mandala).toBeNull()
    expect(isLoading).toBe(false)
    expect(error).toBeNull()
  })

  it('should set mandala', () => {
    useMandalaStore.getState().setMandala(mockMandala)

    const { mandala } = useMandalaStore.getState()
    expect(mandala).toEqual(mockMandala)
  })

  it('should set loading state', () => {
    useMandalaStore.getState().setLoading(true)
    expect(useMandalaStore.getState().isLoading).toBe(true)

    useMandalaStore.getState().setLoading(false)
    expect(useMandalaStore.getState().isLoading).toBe(false)
  })

  it('should set error', () => {
    useMandalaStore.getState().setError('Test error')
    expect(useMandalaStore.getState().error).toBe('Test error')
  })

  it('should clear error', () => {
    useMandalaStore.getState().setError('Test error')
    expect(useMandalaStore.getState().error).toBe('Test error')

    useMandalaStore.getState().setError(null)
    expect(useMandalaStore.getState().error).toBeNull()
  })

  it('should update current day and add to completed days', () => {
    useMandalaStore.getState().setMandala(mockMandala)

    useMandalaStore.getState().updateProgress(4, [1, 2, 3])

    const { mandala } = useMandalaStore.getState()
    expect(mandala?.current_day).toBe(4)
    expect(mandala?.completed_days).toEqual([1, 2, 3])
  })
})
