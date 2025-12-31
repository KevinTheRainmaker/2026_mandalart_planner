import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Day5SubGoals } from '../Day5SubGoals'
import type { Mandala } from '@/types'

describe('Day5SubGoals', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: {
      '0': '열정적인 순간',
      '1': '휴식 방법',
      '2': '자유시간 활용',
    },
    reflection_notes: '회고 노트입니다.',
    center_goal: '건강한 삶 만들기',
    sub_goals: ['운동', '식습관', '수면', '스트레스 관리'],
    action_plans: {},
    ai_summary: null,
    current_day: 5,
    completed_days: [1, 2, 3, 4],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Center Goal Display', () => {
    it('should display the center goal at the top', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/2026년 중심 목표/)).toBeInTheDocument()
      const centerGoals = screen.getAllByText(/건강한 삶 만들기/)
      expect(centerGoals.length).toBeGreaterThan(0)
    })

    it('should display the main question with center goal', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName.toLowerCase() === 'h2' &&
            content.includes('를 이루기 위해 필요한 영역을 정해주세요')
          )
        })
      ).toBeInTheDocument()
    })
  })

  describe('Sub-Goals Input Fields', () => {
    it('should display 4 input fields for sub-goals 5-8', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByPlaceholderText(/하위 목표 5/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 6/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 7/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 8/)).toBeInTheDocument()
    })

    it('should allow typing in each sub-goal field', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const input5 = screen.getByPlaceholderText(/하위 목표 5/)
      const input6 = screen.getByPlaceholderText(/하위 목표 6/)

      fireEvent.change(input5, { target: { value: '취미 활동' } })
      fireEvent.change(input6, { target: { value: '사회 관계' } })

      expect(input5).toHaveValue('취미 활동')
      expect(input6).toHaveValue('사회 관계')
    })

    it('should enforce max length of 50 characters for each field', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const input5 = screen.getByPlaceholderText(
        /하위 목표 5/
      ) as HTMLInputElement
      const input6 = screen.getByPlaceholderText(
        /하위 목표 6/
      ) as HTMLInputElement

      expect(input5.maxLength).toBe(50)
      expect(input6.maxLength).toBe(50)
    })

    it('should display character count for each field', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const inputs = screen.getAllByText(/0 \/ 50/)
      expect(inputs).toHaveLength(4)

      const input5 = screen.getByPlaceholderText(/하위 목표 5/)
      fireEvent.change(input5, { target: { value: '취미 활동' } })

      expect(screen.getByText(/5 \/ 50/)).toBeInTheDocument()
    })

    it('should restore previous sub-goals 5-8', () => {
      const mandalaWithAllSubGoals = {
        ...mockMandala,
        sub_goals: [
          '운동',
          '식습관',
          '수면',
          '스트레스 관리',
          '취미',
          '관계',
          '학습',
          '재정',
        ],
      }

      render(
        <Day5SubGoals mandala={mandalaWithAllSubGoals} onSave={mockOnSave} />
      )

      expect(screen.getByPlaceholderText(/하위 목표 5/)).toHaveValue('취미')
      expect(screen.getByPlaceholderText(/하위 목표 6/)).toHaveValue('관계')
      expect(screen.getByPlaceholderText(/하위 목표 7/)).toHaveValue('학습')
      expect(screen.getByPlaceholderText(/하위 목표 8/)).toHaveValue('재정')
    })
  })

  describe('Previous Sub-Goals Display', () => {
    it('should display first 4 sub-goals in summary section', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/운동/)).toBeInTheDocument()
      expect(screen.getByText(/식습관/)).toBeInTheDocument()
      expect(screen.getByText(/수면/)).toBeInTheDocument()
      expect(screen.getByText(/스트레스 관리/)).toBeInTheDocument()
    })
  })

  describe('Progress Indicator', () => {
    it('should display progress as 8/8', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/진행률:/)).toBeInTheDocument()
      expect(screen.getByText(/8 \/ 8/)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should disable save button when any field is empty', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()

      // Fill 3 fields
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 5/), {
        target: { value: '취미' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 6/), {
        target: { value: '관계' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 7/), {
        target: { value: '학습' },
      })

      // Still disabled because 8th field is empty
      expect(saveButton).toBeDisabled()
    })

    it('should disable save button when any field is only whitespace', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 5/), {
        target: { value: '취미' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 6/), {
        target: { value: '   ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 7/), {
        target: { value: '학습' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 8/), {
        target: { value: '재정' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when all fields have valid content', () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 5/), {
        target: { value: '취미 활동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 6/), {
        target: { value: '사회 관계' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 7/), {
        target: { value: '지속 학습' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 8/), {
        target: { value: '재정 관리' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with all 8 sub-goals when save button is clicked', async () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 5/), {
        target: { value: '취미 활동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 6/), {
        target: { value: '사회 관계' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 7/), {
        target: { value: '지속 학습' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 8/), {
        target: { value: '재정 관리' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          sub_goals: [
            '운동',
            '식습관',
            '수면',
            '스트레스 관리',
            '취미 활동',
            '사회 관계',
            '지속 학습',
            '재정 관리',
          ],
        })
      })
    })

    it('should trim whitespace from sub-goals before saving', async () => {
      render(<Day5SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 5/), {
        target: { value: '  취미  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 6/), {
        target: { value: '  관계  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 7/), {
        target: { value: '  학습  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 8/), {
        target: { value: '  재정  ' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          sub_goals: ['운동', '식습관', '수면', '스트레스 관리', '취미', '관계', '학습', '재정'],
        })
      })
    })
  })
})
