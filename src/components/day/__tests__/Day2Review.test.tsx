import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Day2Review } from '../Day2Review'
import { REFLECTION_THEMES } from '@/constants'
import type { Mandala } from '@/types'

describe('Day2Review', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: {
      '0': '열정을 느낀 순간은 새로운 프로젝트를 시작했을 때입니다.',
      '1': '휴식할 때는 책을 읽고 싶습니다.',
      '2': '자유시간에는 운동을 하고 싶습니다.',
    },
    reflection_notes: null,
    center_goal: null,
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    current_day: 2,
    completed_days: [1],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Display Previous Reflection', () => {
    it('should display the selected theme title', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      expect(
        screen.getByText('다시 하고 싶은 마음을 되찾고 싶다면')
      ).toBeInTheDocument()
    })

    it('should display all questions and answers from Day 1', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      // Check that questions are displayed
      const theme = REFLECTION_THEMES.theme1
      theme.questions.forEach((question) => {
        expect(screen.getByText(new RegExp(question))).toBeInTheDocument()
      })

      // Check that answers are displayed
      expect(
        screen.getByText(/열정을 느낀 순간은 새로운 프로젝트를 시작했을 때입니다/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/휴식할 때는 책을 읽고 싶습니다/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/자유시간에는 운동을 하고 싶습니다/)
      ).toBeInTheDocument()
    })

    it('should handle missing reflection theme gracefully', () => {
      const mandalaWithoutTheme = {
        ...mockMandala,
        reflection_theme: null,
      }

      render(<Day2Review mandala={mandalaWithoutTheme} onSave={mockOnSave} />)

      expect(
        screen.getByText(/회고를 먼저 완료해주세요/)
      ).toBeInTheDocument()
    })
  })

  describe('Notes Input', () => {
    it('should display textarea for reflection notes', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      expect(textarea).toBeInTheDocument()
    })

    it('should allow typing in notes textarea', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      fireEvent.change(textarea, {
        target: { value: '이런 생각이 들었습니다.' },
      })

      expect(textarea).toHaveValue('이런 생각이 들었습니다.')
    })

    it('should restore previous notes', () => {
      const mandalaWithNotes = {
        ...mockMandala,
        reflection_notes: '이전에 작성한 노트입니다.',
      }

      render(<Day2Review mandala={mandalaWithNotes} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      expect(textarea).toHaveValue('이전에 작성한 노트입니다.')
    })

    it('should enforce max length for notes', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(
        /회고 내용을 다시 보며/
      ) as HTMLTextAreaElement
      expect(textarea.maxLength).toBe(2000)
    })

    it('should display character count', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText(/0 \/ 2000/)).toBeInTheDocument()

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      fireEvent.change(textarea, { target: { value: '테스트' } })

      expect(screen.getByText(/3 \/ 2000/)).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('should enable save button when notes are provided', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      fireEvent.change(textarea, { target: { value: '노트 작성' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })

    it('should allow saving with empty notes', () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })

    it('should call onSave with correct data when save button is clicked', async () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const textarea = screen.getByPlaceholderText(/회고 내용을 다시 보며/)
      fireEvent.change(textarea, {
        target: { value: '회고 재검토 노트입니다.' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          reflection_notes: '회고 재검토 노트입니다.',
        })
      })
    })

    it('should call onSave with empty string when no notes provided', async () => {
      render(<Day2Review mandala={mockMandala} onSave={mockOnSave} />)

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          reflection_notes: '',
        })
      })
    })
  })
})
