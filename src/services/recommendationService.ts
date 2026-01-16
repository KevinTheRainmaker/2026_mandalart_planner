/**
 * Recommendation Service
 * Generates AI-powered recommendations for sub-goals and action plans
 */

export interface Recommendation {
  text: string
  reason: string
}

interface RecommendationResponse {
  recommendations: Recommendation[]
}

/**
 * Call Supabase Edge Function for recommendation generation
 */
async function callRecommendationFunction(
  payload: {
    type: 'subGoal' | 'actionPlan'
    centerGoal: string
    subGoal?: string
    existingItems?: string[]
  }
): Promise<RecommendationResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({ action: 'generateRecommendations', payload }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Recommendation API error:', errorData)
    throw new Error(errorData.message || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Generate sub-goal recommendations based on center goal
 */
export async function generateSubGoalRecommendations(
  centerGoal: string,
  existingSubGoals: string[] = []
): Promise<Recommendation[]> {
  try {
    const result = await callRecommendationFunction({
      type: 'subGoal',
      centerGoal,
      existingItems: existingSubGoals.filter(Boolean),
    })
    return result.recommendations || []
  } catch (error) {
    console.error('Sub-goal recommendation failed:', error)
    return []
  }
}

/**
 * Generate action plan recommendations based on center goal and sub-goal
 */
export async function generateActionPlanRecommendations(
  centerGoal: string,
  subGoal: string,
  existingActionPlans: string[] = []
): Promise<Recommendation[]> {
  try {
    const result = await callRecommendationFunction({
      type: 'actionPlan',
      centerGoal,
      subGoal,
      existingItems: existingActionPlans.filter(Boolean),
    })
    return result.recommendations || []
  } catch (error) {
    console.error('Action plan recommendation failed:', error)
    return []
  }
}
