import {
  CENTER_GOAL_MAX_LENGTH,
  SUB_GOAL_MAX_LENGTH,
  ACTION_PLAN_MAX_LENGTH,
  TOTAL_SUB_GOALS,
  TOTAL_ACTION_PLANS_PER_GOAL,
  TOTAL_DAYS,
} from '@/constants'

/**
 * Validate center goal
 */
export function validateCenterGoal(goal: string): boolean {
  const trimmed = goal.trim()
  return trimmed.length > 0 && trimmed.length <= CENTER_GOAL_MAX_LENGTH
}

/**
 * Validate single sub goal
 */
export function validateSubGoal(goal: string): boolean {
  const trimmed = goal.trim()
  return trimmed.length > 0 && trimmed.length <= SUB_GOAL_MAX_LENGTH
}

/**
 * Validate all 8 sub goals
 */
export function validateSubGoals(goals: string[]): boolean {
  if (goals.length !== TOTAL_SUB_GOALS) {
    return false
  }
  return goals.every((goal) => validateSubGoal(goal))
}

/**
 * Validate single action plan
 */
export function validateActionPlan(plan: string): boolean {
  const trimmed = plan.trim()
  return trimmed.length > 0 && trimmed.length <= ACTION_PLAN_MAX_LENGTH
}

/**
 * Validate 8 action plans for a sub goal
 */
export function validateActionPlans(plans: string[]): boolean {
  if (plans.length !== TOTAL_ACTION_PLANS_PER_GOAL) {
    return false
  }
  return plans.every((plan) => validateActionPlan(plan))
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate day number (1-14)
 */
export function validateDay(day: number): boolean {
  return day >= 1 && day <= TOTAL_DAYS
}
