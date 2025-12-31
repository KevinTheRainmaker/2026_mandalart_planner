import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAIReport } from '../gemini'
import type { Mandala } from '@/types'

// Mock Gemini AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            reflection_summary: '테마: 자기발견. 주요 감정: 열정, 성취. 패턴: 성장 지향',
            goal_analysis: '중심 목표와 하위 목표가 잘 연계됨. 액션플랜이 구체적이고 실행 가능함.',
            keywords: ['성장', '건강', '목표달성'],
            insights: '회고와 목표가 일관성 있음. 체계적인 계획 수립이 돋보임.',
          }),
        },
      }),
    }),
  })),
}))

describe('Gemini AI Service', () => {
  const mockMandala: Mandala = {
    id: 'test-id',
    user_id: 'user-123',
    year: 2026,
    reflection_theme: 'theme1',
    reflection_answers: {
      '0': '열정적으로 일할 때',
      '1': '자연 속에서 휴식',
      '2': '독서와 운동',
    },
    reflection_notes: '올해는 더 성장하고 싶습니다.',
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
      '0': ['아침 조깅', '헬스장', '스트레칭', '계단', '자전거', '수영', '요가', '필라테스'],
      '1': ['채소', '단백질', '물', '금연', '금주', '비타민', '식단', '영양'],
    },
    ai_summary: null,
    current_day: 14,
    completed_days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    marketing_consent: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-14',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAIReport', () => {
    it('should generate AI report from mandala data', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result).toHaveProperty('reflection_summary')
      expect(result).toHaveProperty('goal_analysis')
      expect(result).toHaveProperty('keywords')
      expect(result).toHaveProperty('insights')
    })

    it('should return reflection summary with theme and emotions', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.reflection_summary).toBeTruthy()
      expect(result.reflection_summary).toContain('테마')
    })

    it('should return goal analysis with connectivity assessment', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.goal_analysis).toBeTruthy()
      expect(typeof result.goal_analysis).toBe('string')
    })

    it('should return keywords as an array', async () => {
      const result = await generateAIReport(mockMandala)

      expect(Array.isArray(result.keywords)).toBe(true)
      expect(result.keywords.length).toBeGreaterThan(0)
    })

    it('should return insights about consistency', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.insights).toBeTruthy()
      expect(typeof result.insights).toBe('string')
    })

    it('should handle missing API key gracefully', async () => {
      const originalEnv = import.meta.env.VITE_GEMINI_API_KEY
      // @ts-ignore
      import.meta.env.VITE_GEMINI_API_KEY = ''

      await expect(generateAIReport(mockMandala)).rejects.toThrow()

      // @ts-ignore
      import.meta.env.VITE_GEMINI_API_KEY = originalEnv
    })

    it('should include reflection theme in analysis', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.reflection_summary).toBeTruthy()
    })

    it('should analyze all sub goals', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.goal_analysis).toBeTruthy()
    })

    it('should extract meaningful keywords', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.keywords).toBeTruthy()
      expect(result.keywords.length).toBeGreaterThan(0)
      result.keywords.forEach(keyword => {
        expect(typeof keyword).toBe('string')
        expect(keyword.length).toBeGreaterThan(0)
      })
    })

    it('should provide actionable insights', async () => {
      const result = await generateAIReport(mockMandala)

      expect(result.insights).toBeTruthy()
      expect(result.insights.length).toBeGreaterThan(0)
    })
  })
})
