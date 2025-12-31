import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DayActionPlan } from '../DayActionPlan'
import type { Mandala } from '@/types'

describe('DayActionPlan', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: {},
    reflection_notes: '회고 노트입니다.',
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
    action_plans: {},
    ai_summary: null,
    current_day: 6,
    completed_days: [1, 2, 3, 4, 5],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Day 6 (Sub-goal 1)', () => {
    it('should display the correct sub-goal for Day 6', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      expect(screen.getByText(/하위 목표 1/)).toBeInTheDocument()
      const subGoals = screen.getAllByText(/규칙적인 운동/)
      expect(subGoals.length).toBeGreaterThan(0)
    })

    it('should display the main question with sub-goal', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName.toLowerCase() === 'h2' &&
            content.includes('을 달성하기 위한 구체적인 행동')
          )
        })
      ).toBeInTheDocument()
    })
  })

  describe('Day 8 (Sub-goal 3)', () => {
    it('should display the correct sub-goal for Day 8', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={8} onSave={mockOnSave} />
      )

      expect(screen.getByText(/하위 목표 3/)).toBeInTheDocument()
      const subGoals = screen.getAllByText(/충분한 수면/)
      expect(subGoals.length).toBeGreaterThan(0)
    })
  })

  describe('Action Plan Input Fields', () => {
    it('should display 8 input fields for action plans', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      for (let i = 1; i <= 8; i++) {
        expect(
          screen.getByPlaceholderText(new RegExp(`액션플랜 ${i}`))
        ).toBeInTheDocument()
      }
    })

    it('should allow typing in each action plan field', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      const input1 = screen.getByPlaceholderText(/액션플랜 1/)
      const input2 = screen.getByPlaceholderText(/액션플랜 2/)

      fireEvent.change(input1, { target: { value: '매일 아침 30분 조깅' } })
      fireEvent.change(input2, { target: { value: '주 3회 헬스장 가기' } })

      expect(input1).toHaveValue('매일 아침 30분 조깅')
      expect(input2).toHaveValue('주 3회 헬스장 가기')
    })

    it('should enforce max length of 50 characters for each field', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      const input1 = screen.getByPlaceholderText(
        /액션플랜 1/
      ) as HTMLInputElement
      expect(input1.maxLength).toBe(50)
    })

    it('should display character count for each field', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      const counters = screen.getAllByText(/0 \/ 50/)
      expect(counters).toHaveLength(8)

      const input1 = screen.getByPlaceholderText(/액션플랜 1/)
      fireEvent.change(input1, { target: { value: '조깅하기' } })

      const updatedCounters = screen.getAllByText((content) =>
        Boolean(content.match(/^4 \/ 50$/))
      )
      expect(updatedCounters.length).toBeGreaterThan(0)
    })

    it('should restore previous action plans', () => {
      const mandalaWithActionPlans = {
        ...mockMandala,
        action_plans: {
          '0': [
            '매일 아침 조깅',
            '헬스장 가기',
            '스트레칭',
            '계단 오르기',
            '자전거 타기',
            '수영',
            '요가',
            '필라테스',
          ],
        },
      }

      render(
        <DayActionPlan
          mandala={mandalaWithActionPlans}
          dayNumber={6}
          onSave={mockOnSave}
        />
      )

      expect(screen.getByPlaceholderText(/액션플랜 1/)).toHaveValue(
        '매일 아침 조깅'
      )
      expect(screen.getByPlaceholderText(/액션플랜 2/)).toHaveValue('헬스장 가기')
      expect(screen.getByPlaceholderText(/액션플랜 8/)).toHaveValue('필라테스')
    })
  })

  describe('Progress Indicator', () => {
    it('should display progress for Day 6 as 1/8', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      expect(screen.getByText(/진행률:/)).toBeInTheDocument()
      expect(screen.getByText(/1 \/ 8/)).toBeInTheDocument()
    })

    it('should display progress for Day 10 as 5/8', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={10} onSave={mockOnSave} />
      )

      expect(screen.getByText(/5 \/ 8/)).toBeInTheDocument()
    })

    it('should display progress for Day 13 as 8/8', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={13} onSave={mockOnSave} />
      )

      expect(screen.getByText(/8 \/ 8/)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should disable save button when any field is empty', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()

      // Fill 7 fields
      for (let i = 1; i <= 7; i++) {
        fireEvent.change(screen.getByPlaceholderText(new RegExp(`액션플랜 ${i}`)), {
          target: { value: `액션 ${i}` },
        })
      }

      // Still disabled because 8th field is empty
      expect(saveButton).toBeDisabled()
    })

    it('should disable save button when any field is only whitespace', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      for (let i = 1; i <= 7; i++) {
        fireEvent.change(screen.getByPlaceholderText(new RegExp(`액션플랜 ${i}`)), {
          target: { value: `액션 ${i}` },
        })
      }
      fireEvent.change(screen.getByPlaceholderText(/액션플랜 8/), {
        target: { value: '   ' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when all fields have valid content', () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      for (let i = 1; i <= 8; i++) {
        fireEvent.change(screen.getByPlaceholderText(new RegExp(`액션플랜 ${i}`)), {
          target: { value: `액션 ${i}` },
        })
      }

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with correct data when save button is clicked', async () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      const actionPlans = [
        '매일 아침 조깅',
        '헬스장 주 3회',
        '스트레칭 10분',
        '계단 오르기',
        '자전거 출퇴근',
        '주말 등산',
        '요가 수업',
        '필라테스',
      ]

      actionPlans.forEach((plan, index) => {
        fireEvent.change(
          screen.getByPlaceholderText(new RegExp(`액션플랜 ${index + 1}`)),
          { target: { value: plan } }
        )
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          action_plans: {
            '0': actionPlans,
          },
        })
      })
    })

    it('should save action plans for Day 8 (sub-goal index 2)', async () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={8} onSave={mockOnSave} />
      )

      const actionPlans = Array.from({ length: 8 }, (_, i) => `액션 ${i + 1}`)

      actionPlans.forEach((plan, index) => {
        fireEvent.change(
          screen.getByPlaceholderText(new RegExp(`액션플랜 ${index + 1}`)),
          { target: { value: plan } }
        )
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          action_plans: {
            '2': actionPlans,
          },
        })
      })
    })

    it('should trim whitespace from action plans before saving', async () => {
      render(
        <DayActionPlan mandala={mockMandala} dayNumber={6} onSave={mockOnSave} />
      )

      for (let i = 1; i <= 8; i++) {
        fireEvent.change(screen.getByPlaceholderText(new RegExp(`액션플랜 ${i}`)), {
          target: { value: `  액션 ${i}  ` },
        })
      }

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          action_plans: {
            '0': Array.from({ length: 8 }, (_, i) => `액션 ${i + 1}`),
          },
        })
      })
    })
  })
})
