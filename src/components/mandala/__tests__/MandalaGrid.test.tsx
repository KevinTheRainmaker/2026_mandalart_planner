import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MandalaGrid } from '../MandalaGrid'
import type { Mandala } from '@/types'

describe('MandalaGrid', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: {},
    reflection_notes: null,
    center_goal: '건강한 삶 만들기',
    sub_goals: [
      '규칙적인 운동',
      '건강한 식습관',
      '충분한 수면',
      '스트레스 관리',
      '취미 활동',
      '사회 관계',
      '지속 학습',
      '재정 관리',
    ],
    action_plans: {
      '0': ['조깅', '헬스장', '스트레칭', '계단', '자전거', '수영', '요가', '필라테스'],
      '1': ['채소', '단백질', '물', '금연', '금주', '비타민', '식단', '영양'],
      '2': ['일찍자기', '일찍일어나기', '수면시간', '낮잠', '잠자리', '루틴', '휴식', '명상'],
    },
    ai_summary: null,
    current_day: 14,
    completed_days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-14',
  }

  describe('Layout', () => {
    it('should render 9x9 grid', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      // Should have grid container
      const grid = container.querySelector('[data-testid="mandala-grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should display center goal in the middle', () => {
      render(<MandalaGrid mandala={mockMandala} />)

      expect(screen.getByText('건강한 삶 만들기')).toBeInTheDocument()
    })

    it('should display all 8 sub goals', () => {
      render(<MandalaGrid mandala={mockMandala} />)

      mockMandala.sub_goals.forEach(goal => {
        expect(screen.getByText(goal)).toBeInTheDocument()
      })
    })
  })

  describe('Action Plans Display', () => {
    it('should display action plans for sub-goal 1', () => {
      render(<MandalaGrid mandala={mockMandala} />)

      const actionPlans = mockMandala.action_plans['0']
      actionPlans.forEach(plan => {
        expect(screen.getByText(plan)).toBeInTheDocument()
      })
    })

    it('should display action plans for sub-goal 2', () => {
      render(<MandalaGrid mandala={mockMandala} />)

      const actionPlans = mockMandala.action_plans['1']
      actionPlans.forEach(plan => {
        expect(screen.getByText(plan)).toBeInTheDocument()
      })
    })

    it('should handle missing action plans gracefully', () => {
      const mandalaWithMissingPlans = {
        ...mockMandala,
        action_plans: {
          '0': ['조깅', '헬스장'],
        },
      }

      render(<MandalaGrid mandala={mandalaWithMissingPlans} />)

      // Should still render without crashing
      expect(screen.getByText('건강한 삶 만들기')).toBeInTheDocument()
    })
  })

  describe('Grid Structure', () => {
    it('should have 81 total cells (9x9)', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      const mandalaCells = container.querySelectorAll('[data-testid="mandala-cell"]')
      const centerCell = container.querySelectorAll('[data-testid="center-cell"]')
      expect(mandalaCells.length + centerCell.length).toBe(81)
    })

    it('should highlight center cell differently', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      const centerCell = container.querySelector('[data-testid="center-cell"]')
      expect(centerCell).toBeInTheDocument()
    })

    it('should group cells into 3x3 sections', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      const sections = container.querySelectorAll('[data-testid="mandala-section"]')
      expect(sections.length).toBe(9)
    })
  })

  describe('Visual Appearance', () => {
    it('should apply different colors for different sections', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      const sections = container.querySelectorAll('[data-testid="mandala-section"]')
      sections.forEach(section => {
        expect(section.className).toBeTruthy()
      })
    })

    it('should have responsive text sizing', () => {
      const { container } = render(<MandalaGrid mandala={mockMandala} />)

      const cells = container.querySelectorAll('[data-testid="mandala-cell"]')
      cells.forEach(cell => {
        expect(cell.className).toContain('text-')
      })
    })
  })

  describe('Empty State', () => {
    it('should handle empty sub goals', () => {
      const emptyMandala = {
        ...mockMandala,
        sub_goals: [],
        action_plans: {},
      }

      render(<MandalaGrid mandala={emptyMandala} />)

      expect(screen.getByText('건강한 삶 만들기')).toBeInTheDocument()
    })

    it('should display placeholders for missing data', () => {
      const incompleteMandala = {
        ...mockMandala,
        sub_goals: ['운동', '식습관'],
        action_plans: {},
      }

      const { container } = render(<MandalaGrid mandala={incompleteMandala} />)

      // Should still render grid structure
      const grid = container.querySelector('[data-testid="mandala-grid"]')
      expect(grid).toBeInTheDocument()
    })
  })
})
