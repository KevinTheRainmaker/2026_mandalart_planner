import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Day1Reflection } from '../Day1Reflection'
import { REFLECTION_THEMES } from '@/constants'
import type { Mandala } from '@/types'

describe('Day1Reflection', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: null,
    reflection_answers: {},
    reflection_notes: null,
    center_goal: null,
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    current_day: 1,
    completed_days: [],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Theme Selection', () => {
    it('should display all 6 reflection themes', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      expect(screen.getByText('2025년 회고')).toBeInTheDocument()
      expect(
        screen.getByText('아래 테마 중 하나를 선택하고 질문에 답변해주세요.')
      ).toBeInTheDocument()

      Object.values(REFLECTION_THEMES).forEach((theme) => {
        expect(screen.getByText(theme.title)).toBeInTheDocument()
      })
    })

    it('should select a theme when clicked', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      // Should show textareas for each question in theme1
      const textareas = screen.getAllByRole('textbox')
      expect(textareas).toHaveLength(REFLECTION_THEMES.theme1.questions.length)

      // Should show the theme title in h2
      expect(
        screen.getByRole('heading', {
          name: '다시 하고 싶은 마음을 되찾고 싶다면',
        })
      ).toBeInTheDocument()
    })

    it('should restore previously selected theme', () => {
      const mandalaWithTheme: Mandala = {
        ...mockMandala,
        reflection_theme: 'theme2',
        reflection_answers: {
          '0': 'answer1',
          '1': 'answer2',
          '2': 'answer3',
          '3': 'answer4',
        },
      }

      render(
        <Day1Reflection mandala={mandalaWithTheme} onSave={mockOnSave} />
      )

      // Should show textareas for each question in theme2
      const textareas = screen.getAllByRole('textbox')
      expect(textareas).toHaveLength(REFLECTION_THEMES.theme2.questions.length)

      // Should show the theme title in h2
      expect(
        screen.getByRole('heading', {
          name: '번아웃이 올 듯 말 듯 바빴던 1년이라면',
        })
      ).toBeInTheDocument()
    })
  })

  describe('Question Answering', () => {
    it('should display textarea for each question', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      const textareas = screen.getAllByRole('textbox')
      expect(textareas).toHaveLength(
        REFLECTION_THEMES.theme1.questions.length
      )
    })

    it('should update answer when typing', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      const firstTextarea = screen.getAllByRole('textbox')[0]
      fireEvent.change(firstTextarea, {
        target: { value: '테스트 답변입니다.' },
      })

      expect(firstTextarea).toHaveValue('테스트 답변입니다.')
    })

    it('should restore previous answers', () => {
      const mandalaWithAnswers: Mandala = {
        ...mockMandala,
        reflection_theme: 'theme1',
        reflection_answers: {
          '0': '답변 1',
          '1': '답변 2',
          '2': '답변 3',
        },
      }

      render(
        <Day1Reflection mandala={mandalaWithAnswers} onSave={mockOnSave} />
      )

      const textareas = screen.getAllByRole('textbox')
      expect(textareas[0]).toHaveValue('답변 1')
      expect(textareas[1]).toHaveValue('답변 2')
      expect(textareas[2]).toHaveValue('답변 3')
    })

    it('should enforce max length for answers', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      const firstTextarea = screen.getAllByRole(
        'textbox'
      )[0] as HTMLTextAreaElement
      expect(firstTextarea.maxLength).toBe(1000)
    })
  })

  describe('Save Functionality', () => {
    it('should not show save button when no theme is selected', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      // Should be in theme selection mode, no save button
      const saveButton = screen.queryByRole('button', { name: /저장/i })
      expect(saveButton).not.toBeInTheDocument()
    })

    it('should enable save button when theme is selected and at least one answer is provided', async () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      const firstTextarea = screen.getAllByRole('textbox')[0]
      fireEvent.change(firstTextarea, {
        target: { value: '테스트 답변입니다.' },
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      expect(saveButton).toBeEnabled()
    })

    it('should call onSave with correct data when save button is clicked', async () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[0], { target: { value: '답변 1' } })
      fireEvent.change(textareas[1], { target: { value: '답변 2' } })
      fireEvent.change(textareas[2], { target: { value: '답변 3' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          reflection_theme: 'theme1',
          reflection_answers: {
            '0': '답변 1',
            '1': '답변 2',
            '2': '답변 3',
          },
        })
      })
    })
  })

  describe('Change Theme', () => {
    it('should allow changing theme before saving', () => {
      render(<Day1Reflection mandala={mockMandala} onSave={mockOnSave} />)

      // Select theme1
      const theme1Card = screen.getByText(
        '다시 하고 싶은 마음을 되찾고 싶다면'
      )
      fireEvent.click(theme1Card)

      // Should show "테마 변경" button
      const changeButton = screen.getByRole('button', {
        name: /테마 변경/i,
      })
      expect(changeButton).toBeInTheDocument()

      // Click change theme button
      fireEvent.click(changeButton)

      // Should show theme selection again
      Object.values(REFLECTION_THEMES).forEach((theme) => {
        expect(screen.getByText(theme.title)).toBeInTheDocument()
      })
    })
  })
})
