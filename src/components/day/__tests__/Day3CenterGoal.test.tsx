import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Day3CenterGoal } from '../Day3CenterGoal'
import type { Mandala } from '@/types'

describe('Day3CenterGoal', () => {
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
    center_goal: null,
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    current_day: 3,
    completed_days: [1, 2],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Summary Section', () => {
    it('should display Day 1-2 summary section', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/Day 1-2 요약/)).toBeInTheDocument()
    })

    it('should display reflection theme in summary', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      expect(
        screen.getByText(/다시 하고 싶은 마음을 되찾고 싶다면/)
      ).toBeInTheDocument()
    })

    it('should display reflection notes in summary', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/회고 노트입니다/)).toBeInTheDocument()
    })

    it('should toggle summary section when clicked', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const toggleButton = screen.getByRole('button', { name: /Day 1-2 요약/ })

      // Initially should show content
      expect(screen.getByText(/회고 노트입니다/)).toBeInTheDocument()

      // Click to collapse
      fireEvent.click(toggleButton)

      // Content should be hidden
      expect(screen.queryByText(/회고 노트입니다/)).not.toBeInTheDocument()

      // Click to expand
      fireEvent.click(toggleButton)

      // Content should be visible again
      expect(screen.getByText(/회고 노트입니다/)).toBeInTheDocument()
    })
  })

  describe('Center Goal Input', () => {
    it('should display the main question', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      expect(
        screen.getByText(/2026년, 당신이 이루고 싶은 가장 중요한 것은 무엇인가요/)
      ).toBeInTheDocument()
    })

    it('should display input field for center goal', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      expect(input).toBeInTheDocument()
    })

    it('should allow typing in center goal input', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '행복한 가정 만들기' } })

      expect(input).toHaveValue('행복한 가정 만들기')
    })

    it('should restore previous center goal', () => {
      const mandalaWithGoal = {
        ...mockMandala,
        center_goal: '성공적인 커리어 구축',
      }

      render(<Day3CenterGoal mandala={mandalaWithGoal} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      expect(input).toHaveValue('성공적인 커리어 구축')
    })

    it('should enforce max length of 100 characters', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(
        /예: 건강한 삶/
      ) as HTMLInputElement
      expect(input.maxLength).toBe(100)
    })

    it('should display character count', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument()

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '목표' } })

      expect(screen.getByText(/2 \/ 100/)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should disable save button when center goal is empty', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()
    })

    it('should disable save button when center goal is only whitespace', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '   ' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when valid center goal is provided', () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '건강한 삶 만들기' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with correct data when save button is clicked', async () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '행복한 가정 만들기' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          center_goal: '행복한 가정 만들기',
        })
      })
    })

    it('should trim whitespace from center goal before saving', async () => {
      render(<Day3CenterGoal mandala={mockMandala} onSave={mockOnSave} />)

      const input = screen.getByPlaceholderText(/예: 건강한 삶/)
      fireEvent.change(input, { target: { value: '  목표 달성  ' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          center_goal: '목표 달성',
        })
      })
    })
  })
})
