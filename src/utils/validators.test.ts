import { describe, it, expect } from 'vitest'
import {
  validateCenterGoal,
  validateSubGoals,
  validateSubGoal,
  validateActionPlan,
  validateActionPlans,
  validateEmail,
  validateDay,
} from './validators'

describe('validators', () => {
  describe('validateCenterGoal', () => {
    it('should return true for valid goal', () => {
      expect(validateCenterGoal('내 목표')).toBe(true)
      expect(validateCenterGoal('a'.repeat(100))).toBe(true)
    })

    it('should return false for empty goal', () => {
      expect(validateCenterGoal('')).toBe(false)
      expect(validateCenterGoal('   ')).toBe(false)
    })

    it('should return false for goal exceeding 100 chars', () => {
      expect(validateCenterGoal('a'.repeat(101))).toBe(false)
    })
  })

  describe('validateSubGoal', () => {
    it('should return true for valid sub goal', () => {
      expect(validateSubGoal('하위 목표')).toBe(true)
      expect(validateSubGoal('a'.repeat(50))).toBe(true)
    })

    it('should return false for empty sub goal', () => {
      expect(validateSubGoal('')).toBe(false)
      expect(validateSubGoal('   ')).toBe(false)
    })

    it('should return false for sub goal exceeding 50 chars', () => {
      expect(validateSubGoal('a'.repeat(51))).toBe(false)
    })
  })

  describe('validateSubGoals', () => {
    it('should return true for 8 valid sub goals', () => {
      const goals = Array(8).fill('목표')
      expect(validateSubGoals(goals)).toBe(true)
    })

    it('should return false if not 8 goals', () => {
      expect(validateSubGoals(Array(7).fill('목표'))).toBe(false)
      expect(validateSubGoals(Array(9).fill('목표'))).toBe(false)
    })

    it('should return false if any goal is invalid', () => {
      const goals = Array(8).fill('목표')
      goals[3] = '' // empty goal
      expect(validateSubGoals(goals)).toBe(false)
    })

    it('should return false if any goal exceeds max length', () => {
      const goals = Array(8).fill('목표')
      goals[5] = 'a'.repeat(51)
      expect(validateSubGoals(goals)).toBe(false)
    })
  })

  describe('validateActionPlan', () => {
    it('should return true for valid action plan', () => {
      expect(validateActionPlan('액션 플랜')).toBe(true)
      expect(validateActionPlan('a'.repeat(50))).toBe(true)
    })

    it('should return false for empty action plan', () => {
      expect(validateActionPlan('')).toBe(false)
      expect(validateActionPlan('   ')).toBe(false)
    })

    it('should return false for action plan exceeding 50 chars', () => {
      expect(validateActionPlan('a'.repeat(51))).toBe(false)
    })
  })

  describe('validateActionPlans', () => {
    it('should return true for 8 valid action plans', () => {
      const plans = Array(8).fill('액션')
      expect(validateActionPlans(plans)).toBe(true)
    })

    it('should return false if not 8 plans', () => {
      expect(validateActionPlans(Array(7).fill('액션'))).toBe(false)
      expect(validateActionPlans(Array(9).fill('액션'))).toBe(false)
    })

    it('should return false if any plan is invalid', () => {
      const plans = Array(8).fill('액션')
      plans[2] = ''
      expect(validateActionPlans(plans)).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.kr')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })
  })

  describe('validateDay', () => {
    it('should return true for valid day (1-14)', () => {
      expect(validateDay(1)).toBe(true)
      expect(validateDay(7)).toBe(true)
      expect(validateDay(14)).toBe(true)
    })

    it('should return false for invalid day', () => {
      expect(validateDay(0)).toBe(false)
      expect(validateDay(15)).toBe(false)
      expect(validateDay(-1)).toBe(false)
    })
  })
})
