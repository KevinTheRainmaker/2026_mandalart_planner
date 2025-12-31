import { supabase } from './supabase'
import type {
  Mandala,
  MandalaCreate,
  MandalaUpdate,
  GenerateSummaryRequest,
  GenerateSummaryResponse,
} from '@/types'

/**
 * Create a new Mandala
 */
export async function createMandala(data: MandalaCreate): Promise<Mandala | null> {
  const { data: mandala, error } = await supabase
    .from('mandalas')
    .insert(data as any)
    .select()
    .single() as any

  if (error) {
    console.error('Error creating mandala:', error)
    return null
  }

  return mandala as Mandala
}

/**
 * Get user's Mandala for a specific year
 */
export async function getMandala(
  userId: string,
  year: number
): Promise<Mandala | null> {
  const { data, error } = await supabase
    .from('mandalas')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .single() as any

  if (error) {
    console.error('Error fetching mandala:', error)
    return null
  }

  return data as Mandala
}

/**
 * Update Mandala
 */
export async function updateMandala(
  id: string,
  updates: MandalaUpdate
): Promise<Mandala | null> {
  const { data, error } = await supabase
    .from('mandalas')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single() as any

  if (error) {
    console.error('Error updating mandala:', error)
    return null
  }

  return data as Mandala
}

/**
 * Generate AI Summary via Edge Function
 */
export async function generateAISummary(
  request: GenerateSummaryRequest
): Promise<GenerateSummaryResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to generate summary')
    }

    const data = await response.json()

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
