/**
 * Feedback Service
 * Handles saving and retrieving AI recommendation feedback
 */

import { supabase } from '@/lib/supabase'

export interface RecommendationFeedback {
  type: 'subGoal' | 'actionPlan'
  recommendationText: string
  reason?: string
  feedback: 'upvote' | 'downvote'
  centerGoal?: string
  subGoal?: string
}

export interface FeedbackExample {
  text: string
  reason: string
}

/**
 * Save recommendation feedback to database
 */
export async function saveRecommendationFeedback(
  feedback: RecommendationFeedback
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return false
    }

    const { error } = await supabase
      .from('recommendation_feedback')
      .insert({
        user_id: user.id,
        type: feedback.type,
        recommendation_text: feedback.recommendationText,
        reason: feedback.reason,
        feedback: feedback.feedback,
        center_goal: feedback.centerGoal,
        sub_goal: feedback.subGoal,
      })

    if (error) {
      console.error('Failed to save feedback:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Feedback save error:', error)
    return false
  }
}

/**
 * Get positive feedback examples for prompt enhancement
 * Returns upvoted recommendations to use as few-shot examples
 */
export async function getPositiveFeedbackExamples(
  type: 'subGoal' | 'actionPlan',
  limit: number = 5
): Promise<FeedbackExample[]> {
  try {
    const { data, error } = await supabase
      .from('recommendation_feedback')
      .select('recommendation_text, reason')
      .eq('type', type)
      .eq('feedback', 'upvote')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch positive examples:', error)
      return []
    }

    return (data || []).map(item => ({
      text: item.recommendation_text,
      reason: item.reason || '',
    }))
  } catch (error) {
    console.error('Positive examples fetch error:', error)
    return []
  }
}
