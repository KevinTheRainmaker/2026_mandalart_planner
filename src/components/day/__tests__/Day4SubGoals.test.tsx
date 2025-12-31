import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Day4SubGoals } from '../Day4SubGoals'
import type { Mandala } from '@/types'

describe('Day4SubGoals', () => {
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
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    current_day: 4,
    completed_days: [1, 2, 3],
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
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/2026년 중심 목표/)).toBeInTheDocument()
      const centerGoals = screen.getAllByText(/건강한 삶 만들기/)
      expect(centerGoals.length).toBeGreaterThan(0)
    })

    it('should display the main question with center goal', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

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
    it('should display 4 input fields for sub-goals', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByPlaceholderText(/하위 목표 1/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 2/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 3/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/하위 목표 4/)).toBeInTheDocument()
    })

    it('should allow typing in each sub-goal field', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const input1 = screen.getByPlaceholderText(/하위 목표 1/)
      const input2 = screen.getByPlaceholderText(/하위 목표 2/)

      fireEvent.change(input1, { target: { value: '규칙적인 운동' } })
      fireEvent.change(input2, { target: { value: '건강한 식습관' } })

      expect(input1).toHaveValue('규칙적인 운동')
      expect(input2).toHaveValue('건강한 식습관')
    })

    it('should enforce max length of 50 characters for each field', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const input1 = screen.getByPlaceholderText(
        /하위 목표 1/
      ) as HTMLInputElement
      const input2 = screen.getByPlaceholderText(
        /하위 목표 2/
      ) as HTMLInputElement

      expect(input1.maxLength).toBe(50)
      expect(input2.maxLength).toBe(50)
    })

    it('should display character count for each field', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const inputs = screen.getAllByText(/0 \/ 50/)
      expect(inputs).toHaveLength(4)

      const input1 = screen.getByPlaceholderText(/하위 목표 1/)
      fireEvent.change(input1, { target: { value: '규칙적인 운동' } })

      expect(screen.getByText(/7 \/ 50/)).toBeInTheDocument()
    })

    it('should restore previous sub-goals', () => {
      const mandalaWithSubGoals = {
        ...mockMandala,
        sub_goals: ['운동', '식습관', '수면', '스트레스 관리'],
      }

      render(
        <Day4SubGoals mandala={mandalaWithSubGoals} onSave={mockOnSave} />
      )

      expect(screen.getByPlaceholderText(/하위 목표 1/)).toHaveValue('운동')
      expect(screen.getByPlaceholderText(/하위 목표 2/)).toHaveValue('식습관')
      expect(screen.getByPlaceholderText(/하위 목표 3/)).toHaveValue('수면')
      expect(screen.getByPlaceholderText(/하위 목표 4/)).toHaveValue(
        '스트레스 관리'
      )
    })
  })

  describe('Progress Indicator', () => {
    it('should display progress as 4/8', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/진행률:/)).toBeInTheDocument()
      expect(screen.getByText(/4 \/ 8/)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should disable save button when any field is empty', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()

      // Fill 3 fields
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 1/), {
        target: { value: '운동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 2/), {
        target: { value: '식습관' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 3/), {
        target: { value: '수면' },
      })

      // Still disabled because 4th field is empty
      expect(saveButton).toBeDisabled()
    })

    it('should disable save button when any field is only whitespace', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 1/), {
        target: { value: '운동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 2/), {
        target: { value: '   ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 3/), {
        target: { value: '수면' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 4/), {
        target: { value: '관리' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when all fields have valid content', () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 1/), {
        target: { value: '운동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 2/), {
        target: { value: '식습관' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 3/), {
        target: { value: '수면' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 4/), {
        target: { value: '스트레스 관리' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with correct data when save button is clicked', async () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 1/), {
        target: { value: '규칙적인 운동' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 2/), {
        target: { value: '건강한 식습관' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 3/), {
        target: { value: '충분한 수면' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 4/), {
        target: { value: '스트레스 관리' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          sub_goals: [
            '규칙적인 운동',
            '건강한 식습관',
            '충분한 수면',
            '스트레스 관리',
          ],
        })
      })
    })

    it('should trim whitespace from sub-goals before saving', async () => {
      render(<Day4SubGoals mandala={mockMandala} onSave={mockOnSave} />)

      fireEvent.change(screen.getByPlaceholderText(/하위 목표 1/), {
        target: { value: '  운동  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 2/), {
        target: { value: '  식습관  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 3/), {
        target: { value: '  수면  ' },
      })
      fireEvent.change(screen.getByPlaceholderText(/하위 목표 4/), {
        target: { value: '  관리  ' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          sub_goals: ['운동', '식습관', '수면', '관리'],
        })
      })
    })
  })
})
