import { supabase } from '@/lib/supabase'
import type { Mandala, AISummary } from '@/types'

/**
 * Call Supabase Edge Function for Gemini API
 */
async function callGeminiFunction(
  action: 'generateQuestion' | 'generateGoalSuggestion' | 'generateReport',
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke('gemini-chat', {
    body: { action, payload },
  })

  if (error) {
    console.error('Edge function error:', error)
    throw error
  }

  return data
}

export async function generateAIReport(mandala: Mandala): Promise<AISummary> {
  try {
    console.log('Generating AI report via Edge Function...')

    const result = await callGeminiFunction('generateReport', {
      mandala: {
        reflection_theme: mandala.reflection_theme,
        reflection_answers: mandala.reflection_answers,
        reflection_notes: mandala.reflection_notes,
        center_goal: mandala.center_goal,
        sub_goals: mandala.sub_goals,
        action_plans: mandala.action_plans,
      },
    })

    const aiSummary = result as unknown as AISummary

    // Validate response structure
    if (
      !aiSummary.reflection_summary ||
      !aiSummary.goal_analysis ||
      !aiSummary.keywords ||
      !aiSummary.insights
    ) {
      console.error('Invalid AI response structure:', aiSummary)
      throw new Error('Invalid AI response structure - missing required fields')
    }

    console.log('AI report generated successfully')
    return aiSummary
  } catch (error) {
    console.error('Error generating AI report:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI report: ${error.message}`)
    }
    throw new Error('Failed to generate AI report - unknown error')
  }
}
