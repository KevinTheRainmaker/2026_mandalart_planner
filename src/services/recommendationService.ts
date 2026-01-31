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

export interface OtherSubGoalPlans {
  subGoal: string
  plans: string[]
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
    otherSubGoalsPlans?: OtherSubGoalPlans[]
    customPrompt?: string
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
  existingSubGoals: string[] = [],
  customPrompt?: string
): Promise<Recommendation[]> {
  try {
    const result = await callRecommendationFunction({
      type: 'subGoal',
      centerGoal,
      existingItems: existingSubGoals.filter(Boolean),
      customPrompt,
    })
    return result.recommendations || []
  } catch (error) {
    console.error('Sub-goal recommendation failed:', error)
    return []
  }
}

/**
 * Generate action plan recommendations based on center goal and sub-goal
 * @param centerGoal - The main goal at the center of mandala
 * @param subGoal - The current sub-goal for which to generate action plans
 * @param existingActionPlans - Action plans already added for this sub-goal
 * @param otherSubGoalsPlans - Action plans from other sub-goals to avoid duplication
 * @param customPrompt - Optional user-provided context for recommendation
 */
export async function generateActionPlanRecommendations(
  centerGoal: string,
  subGoal: string,
  existingActionPlans: string[] = [],
  otherSubGoalsPlans: OtherSubGoalPlans[] = [],
  customPrompt?: string
): Promise<Recommendation[]> {
  try {
    const result = await callRecommendationFunction({
      type: 'actionPlan',
      centerGoal,
      subGoal,
      existingItems: existingActionPlans.filter(Boolean),
      otherSubGoalsPlans: otherSubGoalsPlans.filter(item => item.plans && item.plans.length > 0),
      customPrompt,
    })
    return result.recommendations || []
  } catch (error) {
    console.error('Action plan recommendation failed:', error)
    return []
  }
}
