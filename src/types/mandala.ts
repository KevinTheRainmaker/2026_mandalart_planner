/**
 * Mandala Type Definitions
 * Following TRD Database Schema
 */

export type ReflectionThemeKey = 'theme1' | 'theme2' | 'theme3' | 'theme4' | 'theme5' | 'theme6'

export interface ReflectionAnswers {
  [questionId: string]: string
}

export interface ActionPlans {
  [subGoalIndex: string]: string[] // 0-7: each contains 8 action plans
}

export interface AISummary {
  reflection_summary: string
  goal_analysis: string
  keywords: string[]
  insights: string
}

export interface Mandala {
  // Primary Key
  id: string

  // Foreign Keys
  user_id: string

  // Year
  year: number

  // Day 1: Reflection
  reflection_theme: ReflectionThemeKey | null
  reflection_answers: ReflectionAnswers

  // Day 2: Reflection Notes
  reflection_notes: string | null

  // Day 3: Center Goal
  center_goal: string | null

  // Day 4-5: Sub Goals (8개)
  sub_goals: string[] // length should be 8

  // Day 6-13: Action Plans (64개)
  action_plans: ActionPlans

  // Day 14: AI Summary
  ai_summary: AISummary | null

  // Progress Tracking
  current_day: number // 1-14
  completed_days: number[]

  // User Consent
  marketing_consent: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

export interface MandalaCreate {
  user_id: string
  year: number
  marketing_consent: boolean
}

export interface MandalaUpdate {
  reflection_theme?: ReflectionThemeKey
  reflection_answers?: ReflectionAnswers
  reflection_notes?: string
  center_goal?: string
  sub_goals?: string[]
  action_plans?: ActionPlans
  ai_summary?: AISummary
  current_day?: number
  completed_days?: number[]
}

export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
