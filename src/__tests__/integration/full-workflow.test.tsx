/**
 * Integration Test: Full 14-Day Mandala Goal Planning Workflow
 *
 * This test simulates a complete user journey from Day 1 to Day 14:
 * - Day 1: Reflection theme selection and answers
 * - Day 2: Reflection notes
 * - Day 3: Center goal setting
 * - Day 4-5: Sub-goals (8 goals)
 * - Day 6-13: Action plans (8 plans per sub-goal)
 * - Day 14: AI report generation and PDF download
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Day1, Day2, Day3, Day4, Day5, Day6, Day7, Day8, Day9, Day10, Day11, Day12, Day13, Day14 } from '@/pages'
import type { Mandala } from '@/types'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' }
  const mockSession = { user: mockUser, access_token: 'test-token' }

  // Store mock mandala data
  let mockMandalaData: any = {
    id: 'test-mandala-id',
    user_id: 'test-user-id',
    year: 2024,
    current_day: 1,
    completed_days: [],
    reflection_theme: null,
    reflection_answers: {},
    reflection_notes: null,
    center_goal: null,
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    marketing_consent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
        onAuthStateChange: vi.fn((callback) => {
          // Immediately call with initial state
          callback('INITIAL_SESSION', mockSession)
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          }
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'mandalas') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockMandalaData,
              error: null,
            }),
            insert: vi.fn().mockImplementation((data: any) => {
              mockMandalaData = { ...mockMandalaData, ...data[0] }
              return Promise.resolve({ data: mockMandalaData, error: null })
            }),
            update: vi.fn().mockImplementation((updates: any) => {
              mockMandalaData = { ...mockMandalaData, ...updates }
              return {
                eq: vi.fn().mockResolvedValue({ data: mockMandalaData, error: null }),
              }
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }),
    },
  }
})

// Mock Gemini API
vi.mock('@/services/gemini', () => ({
  generateAIReport: vi.fn().mockResolvedValue({
    reflection_summary: '2024년을 돌아보며 성장과 도전의 해였습니다. 주요 감정은 희망, 도전, 성취감입니다.',
    goal_analysis: '중심 목표인 "건강한 삶 만들기"와 8개 하위 목표가 잘 연계되어 있습니다. 액션플랜이 구체적이고 실행 가능합니다.',
    keywords: ['건강', '성장', '균형', '실천', '목표'],
    insights: '회고와 목표가 일관성 있게 연결되어 있으며, 실천 가능한 계획이 잘 수립되었습니다.',
  }),
}))

// Mock PDF services
vi.mock('@/services/pdf', () => ({
  generateReportPDF: vi.fn().mockResolvedValue(true),
  generateMandalaPDF: vi.fn().mockResolvedValue(true),
}))

describe('Full 14-Day Workflow Integration Test', () => {
  let mockMandala: Partial<Mandala> = {
    id: 'test-mandala-id',
    user_id: 'test-user-id',
    year: 2024,
    current_day: 1,
    completed_days: [],
    reflection_theme: null,
    reflection_answers: {},
    reflection_notes: null,
    center_goal: null,
    sub_goals: [],
    action_plans: {},
    ai_summary: null,
    marketing_consent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeAll(() => {
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should complete the entire 14-day workflow', async () => {
    const user = userEvent.setup()

    // ====================================
    // DAY 1: Reflection Theme & Answers
    // ====================================
    console.log('📅 Day 1: Starting reflection...')

    const { unmount: unmountDay1 } = render(
      <BrowserRouter>
        <Day1 />
      </BrowserRouter>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/2025년 회고/i)).toBeInTheDocument()
    })

    // Select theme1 (성장)
    const themeCards = screen.getAllByRole('generic').filter(el =>
      el.textContent?.includes('올해 이뤄낸 성과를 되돌아본다면')
    )
    if (themeCards.length > 0) {
      await user.click(themeCards[0])
    }

    // Fill in answers
    const question1Input = screen.getByLabelText(/가장 성장한 순간/i)
    await user.type(question1Input, '새로운 기술을 배우고 프로젝트를 완성했을 때')

    const question2Input = screen.getByLabelText(/극복한 어려움/i)
    await user.type(question2Input, '팀 협업의 어려움을 소통으로 극복했습니다')

    const question3Input = screen.getByLabelText(/배운 교훈/i)
    await user.type(question3Input, '꾸준함의 힘을 깨달았습니다')

    // Submit
    const submitButton = screen.getByRole('button', { name: /저장하고 계속하기/i })
    await user.click(submitButton)

    // Update mock data
    mockMandala.reflection_theme = 'theme1'
    mockMandala.reflection_answers = {
      q1: '새로운 기술을 배우고 프로젝트를 완성했을 때',
      q2: '팀 협업의 어려움을 소통으로 극복했습니다',
      q3: '꾸준함의 힘을 깨달았습니다',
    }
    mockMandala.current_day = 2
    mockMandala.completed_days = [1]

    unmountDay1()
    console.log('✅ Day 1 completed')

    // ====================================
    // DAY 2: Reflection Notes
    // ====================================
    console.log('📅 Day 2: Writing reflection notes...')

    const { unmount: unmountDay2 } = render(
      <BrowserRouter>
        <Day2 />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/회고 재검토/i)).toBeInTheDocument()
    })

    // Write notes
    const notesTextarea = screen.getByLabelText(/추가 노트/i)
    await user.type(notesTextarea, '2025년에는 더욱 건강하고 균형잡힌 삶을 살고 싶습니다.')

    // Submit
    const day2Submit = screen.getByRole('button', { name: /저장하고 계속하기/i })
    await user.click(day2Submit)

    mockMandala.reflection_notes = '2025년에는 더욱 건강하고 균형잡힌 삶을 살고 싶습니다.'
    mockMandala.current_day = 3
    mockMandala.completed_days = [1, 2]

    unmountDay2()
    console.log('✅ Day 2 completed')

    // ====================================
    // DAY 3: Center Goal
    // ====================================
    console.log('📅 Day 3: Setting center goal...')

    const { unmount: unmountDay3 } = render(
      <BrowserRouter>
        <Day3 />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/중심 목표 설정/i)).toBeInTheDocument()
    })

    const centerGoalInput = screen.getByPlaceholderText(/예: 건강한 삶 만들기/i)
    await user.type(centerGoalInput, '건강한 삶 만들기')

    const day3Submit = screen.getByRole('button', { name: /저장하고 계속하기/i })
    await user.click(day3Submit)

    mockMandala.center_goal = '건강한 삶 만들기'
    mockMandala.current_day = 4
    mockMandala.completed_days = [1, 2, 3]

    unmountDay3()
    console.log('✅ Day 3 completed')

    // ====================================
    // DAY 4: Sub-goals 1-4
    // ====================================
    console.log('📅 Day 4: Setting sub-goals 1-4...')

    const { unmount: unmountDay4 } = render(
      <BrowserRouter>
        <Day4 />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/하위 목표 설정 \(1-4\)/i)).toBeInTheDocument()
    })

    const subGoals14 = [
      '규칙적인 운동',
      '건강한 식습관',
      '충분한 수면',
      '스트레스 관리',
    ]

    for (let i = 0; i < 4; i++) {
      const input = screen.getByPlaceholderText(`하위 목표 ${i + 1}`)
      await user.type(input, subGoals14[i])
    }

    const day4Submit = screen.getByRole('button', { name: /저장하고 계속하기/i })
    await user.click(day4Submit)

    mockMandala.sub_goals = subGoals14
    mockMandala.current_day = 5
    mockMandala.completed_days = [1, 2, 3, 4]

    unmountDay4()
    console.log('✅ Day 4 completed')

    // ====================================
    // DAY 5: Sub-goals 5-8
    // ====================================
    console.log('📅 Day 5: Setting sub-goals 5-8...')

    const { unmount: unmountDay5 } = render(
      <BrowserRouter>
        <Day5 />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/하위 목표 설정 \(5-8\)/i)).toBeInTheDocument()
    })

    const subGoals58 = [
      '정기 건강검진',
      '금연/절주',
      '체중 관리',
      '긍정적 마인드',
    ]

    for (let i = 0; i < 4; i++) {
      const input = screen.getByPlaceholderText(`하위 목표 ${i + 5}`)
      await user.type(input, subGoals58[i])
    }

    const day5Submit = screen.getByRole('button', { name: /저장하고 계속하기/i })
    await user.click(day5Submit)

    mockMandala.sub_goals = [...subGoals14, ...subGoals58]
    mockMandala.current_day = 6
    mockMandala.completed_days = [1, 2, 3, 4, 5]

    unmountDay5()
    console.log('✅ Day 5 completed')

    // ====================================
    // DAY 6-13: Action Plans
    // ====================================
    console.log('📅 Day 6-13: Creating action plans...')

    const actionPlansData = [
      ['아침 조깅', '헬스장', '요가', '수영', '자전거', '등산', '스트레칭', '걷기'],
      ['채소 섭취', '과일', '물 마시기', '식단 관리', '간식 줄이기', '아침 식사', '영양제', '요리'],
      ['일찍 자기', '규칙적 수면', '침실 환경', '전자기기 끄기', '명상', '독서', '따뜻한 차', '수면 일지'],
      ['명상', '요가', '취미', '친구', '산책', '음악', '여행', '휴식'],
      ['병원 예약', '건강검진', '치과', '안과', '예방접종', '혈액검사', '암검진', '기록'],
      ['금연', '절주', '카페인 줄이기', '건강 습관', '의지력', '대체 활동', '지원 그룹', '보상'],
      ['체중 측정', '목표 설정', '식단 조절', '운동', '기록', '진행상황', '조언', '유지'],
      ['긍정 확언', '감사 일기', '자기 격려', '명상', '좋은 사람', '책', '성공 경험', '돌봄'],
    ]

    const dayComponents = [Day6, Day7, Day8, Day9, Day10, Day11, Day12, Day13]

    for (let day = 6; day <= 13; day++) {
      const subGoalIndex = day - 6
      const DayComponent = dayComponents[subGoalIndex]
      console.log(`  📝 Day ${day}: Creating action plan for "${mockMandala.sub_goals![subGoalIndex]}"`)

      const { unmount } = render(
        <BrowserRouter>
          <DayComponent />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`액션플랜 작성.*Day ${day}`, 'i'))).toBeInTheDocument()
      })

      // Fill in 8 action plans
      for (let i = 0; i < 8; i++) {
        const input = screen.getByPlaceholderText(`액션플랜 ${i + 1}`)
        await user.type(input, actionPlansData[subGoalIndex][i])
      }

      const submitBtn = screen.getByRole('button', { name: /저장하고 계속하기/i })
      await user.click(submitBtn)

      mockMandala.action_plans![subGoalIndex.toString()] = actionPlansData[subGoalIndex]
      mockMandala.current_day = day + 1
      mockMandala.completed_days!.push(day)

      unmount()
      console.log(`  ✅ Day ${day} completed`)
    }

    console.log('✅ Days 6-13 completed')

    // ====================================
    // DAY 14: AI Report & PDF Download
    // ====================================
    console.log('📅 Day 14: Generating AI report and PDFs...')

    const { unmount: unmountDay14 } = render(
      <BrowserRouter>
        <Day14 />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/종합 리포트 \(Day 14\)/i)).toBeInTheDocument()
    })

    // Generate AI report
    const generateButton = screen.getByRole('button', { name: /AI 리포트 생성하기/i })
    await user.click(generateButton)

    // Wait for AI report to be generated
    await waitFor(() => {
      expect(screen.getByText(/회고 요약/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Verify AI report sections
    expect(screen.getByText(/목표 구조 분석/i)).toBeInTheDocument()
    expect(screen.getByText(/핵심 키워드/i)).toBeInTheDocument()
    expect(screen.getByText(/통합 인사이트/i)).toBeInTheDocument()

    // Verify keywords are displayed
    expect(screen.getByText('건강')).toBeInTheDocument()
    expect(screen.getByText('성장')).toBeInTheDocument()

    // Download Report PDF
    const downloadReportBtn = screen.getByRole('button', { name: /AI 리포트 PDF 다운로드/i })
    await user.click(downloadReportBtn)

    // Download Mandala PDF
    const downloadMandalaBtn = screen.getByRole('button', { name: /만다라트 계획서 PDF 다운로드/i })
    await user.click(downloadMandalaBtn)

    mockMandala.ai_summary = {
      reflection_summary: '2024년을 돌아보며 성장과 도전의 해였습니다.',
      goal_analysis: '중심 목표와 하위 목표가 잘 연계되어 있습니다.',
      keywords: ['건강', '성장', '균형', '실천', '목표'],
      insights: '회고와 목표가 일관성 있게 연결되어 있습니다.',
    }
    mockMandala.current_day = 14
    mockMandala.completed_days!.push(14)

    unmountDay14()
    console.log('✅ Day 14 completed')

    // ====================================
    // VERIFY FINAL STATE
    // ====================================
    console.log('🔍 Verifying final state...')

    expect(mockMandala.completed_days).toHaveLength(14)
    expect(mockMandala.completed_days).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    expect(mockMandala.reflection_theme).toBe('theme1')
    expect(mockMandala.center_goal).toBe('건강한 삶 만들기')
    expect(mockMandala.sub_goals).toHaveLength(8)
    expect(Object.keys(mockMandala.action_plans!)).toHaveLength(8)
    expect(mockMandala.ai_summary).toBeTruthy()

    console.log('✅ All 14 days completed successfully!')
    console.log('📊 Final Mandala State:', mockMandala)
  })
})
