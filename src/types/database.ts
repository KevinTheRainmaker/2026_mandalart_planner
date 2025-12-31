/**
 * Supabase Database Type Definitions
 * Generated from database schema
 */

import type { ReflectionAnswers, ActionPlans, AISummary } from './mandala'

export interface Database {
  public: {
    Tables: {
      mandalas: {
        Row: {
          id: string
          user_id: string
          year: number
          reflection_theme: string | null
          reflection_answers: ReflectionAnswers
          reflection_notes: string | null
          center_goal: string | null
          sub_goals: string[]
          action_plans: ActionPlans
          ai_summary: AISummary | null
          current_day: number
          completed_days: number[]
          marketing_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year?: number
          reflection_theme?: string | null
          reflection_answers?: ReflectionAnswers
          reflection_notes?: string | null
          center_goal?: string | null
          sub_goals?: string[]
          action_plans?: ActionPlans
          ai_summary?: AISummary | null
          current_day?: number
          completed_days?: number[]
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          reflection_theme?: string | null
          reflection_answers?: ReflectionAnswers
          reflection_notes?: string | null
          center_goal?: string | null
          sub_goals?: string[]
          action_plans?: ActionPlans
          ai_summary?: AISummary | null
          current_day?: number
          completed_days?: number[]
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
