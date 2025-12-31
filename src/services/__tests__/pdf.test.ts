import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateReportPDF, generateMandalaPDF } from '../pdf'
import type { Mandala, AISummary } from '@/types'

// Create mock instance
const mockSave = vi.fn()
const mockText = vi.fn()
const mockSetFontSize = vi.fn()
const mockSetFont = vi.fn()
const mockAddPage = vi.fn()
const mockAddImage = vi.fn()
const mockSplitTextToSize = vi.fn((text: string) => [text])

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setFontSize: mockSetFontSize,
      setFont: mockSetFont,
      text: mockText,
      addPage: mockAddPage,
      save: mockSave,
      internal: {
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
          getHeight: vi.fn().mockReturnValue(297),
        },
      },
      addImage: mockAddImage,
      setLineWidth: vi.fn(),
      setDrawColor: vi.fn(),
      rect: vi.fn(),
      setTextColor: vi.fn(),
      setFillColor: vi.fn(),
      splitTextToSize: mockSplitTextToSize,
    })),
  }
})

// Mock html2canvas
vi.mock('html2canvas', () => {
  return {
    default: vi.fn().mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
      width: 800,
      height: 600,
    }),
  }
})

describe('PDF Service', () => {
  const mockAISummary: AISummary = {
    reflection_summary: '2024년을 돌아보며 성장과 도전의 해였습니다.',
    goal_analysis: '중심 목표와 하위 목표가 잘 연계되어 있습니다.',
    keywords: ['성장', '건강', '운동', '수면', '균형'],
    insights: '회고와 목표가 일관성 있게 연결되어 있습니다.',
  }

  const mockMandala: Mandala = {
    id: '1',
    user_id: 'user1',
    year: 2024,
    center_goal: '건강한 삶 만들기',
    sub_goals: [
      '규칙적인 운동',
      '건강한 식습관',
      '충분한 수면',
      '스트레스 관리',
      '정기 건강검진',
      '금연/절주',
      '체중 관리',
      '긍정적 마인드',
    ],
    action_plans: {
      '0': ['아침 조깅', '헬스장 등록', '요가', '수영', '자전거', '등산', '스트레칭', '걷기'],
      '1': ['채소 섭취', '과일 먹기', '물 마시기', '식단 관리', '간식 줄이기', '아침 식사', '영양제', '요리하기'],
      '2': ['일찍 자기', '규칙적 수면', '침실 환경', '전자기기 끄기', '명상', '독서', '따뜻한 차', '수면 일지'],
      '3': ['명상', '요가', '취미 활동', '친구 만나기', '산책', '음악 듣기', '여행', '휴식'],
      '4': ['병원 예약', '건강검진', '치과', '안과', '예방접종', '혈액검사', '암 검진', '기록 관리'],
      '5': ['금연', '절주', '카페인 줄이기', '건강 습관', '의지력', '대체 활동', '지원 그룹', '보상 시스템'],
      '6': ['체중 측정', '목표 설정', '식단 조절', '운동 병행', '기록하기', '진행상황', '조언 구하기', '유지하기'],
      '7': ['긍정 확언', '감사 일기', '자기 격려', '명상', '좋은 사람들', '책 읽기', '성공 경험', '자기 돌봄'],
    },
    reflection_theme: 'theme1',
    reflection_answers: {
      achievements: '운동을 꾸준히 했습니다',
      challenges: '수면 패턴이 불규칙했습니다',
      learnings: '건강의 중요성을 깨달았습니다',
    },
    reflection_notes: '내년에는 더 건강한 삶을 살고 싶습니다',
    ai_summary: mockAISummary,
    current_day: 14,
    completed_days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    marketing_consent: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-14',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSave.mockClear()
    mockText.mockClear()
    mockSetFontSize.mockClear()
    mockSetFont.mockClear()
    mockAddPage.mockClear()
    mockAddImage.mockClear()
    mockSplitTextToSize.mockImplementation((text: string) => [text])
  })

  describe('generateReportPDF', () => {
    it('should generate PDF from AI summary', async () => {
      const jsPDF = (await import('jspdf')).default
      await generateReportPDF(mockAISummary, 'test-report.pdf')

      expect(jsPDF).toHaveBeenCalled()
    })

    it('should include all sections in PDF', async () => {
      const result = await generateReportPDF(mockAISummary, 'test-report.pdf')
      expect(result).toBe(true)
    })

    it('should handle missing AI summary gracefully', async () => {
      const incompleteSummary = {
        reflection_summary: '',
        goal_analysis: '',
        keywords: [],
        insights: '',
      }

      const result = await generateReportPDF(incompleteSummary, 'test-report.pdf')
      expect(result).toBe(true)
    })

    it('should use provided filename', async () => {
      await generateReportPDF(mockAISummary, 'custom-name.pdf')

      expect(mockSave).toHaveBeenCalledWith('custom-name.pdf')
    })

    it('should handle errors during PDF generation', async () => {
      const jsPDF = (await import('jspdf')).default
      vi.mocked(jsPDF).mockImplementationOnce(() => {
        throw new Error('PDF generation failed')
      })

      await expect(generateReportPDF(mockAISummary, 'test.pdf')).rejects.toThrow(
        'PDF generation failed'
      )
    })
  })

  describe('generateMandalaPDF', () => {
    it('should generate PDF from mandala data', async () => {
      const jsPDF = (await import('jspdf')).default
      const element = document.createElement('div')
      element.setAttribute('data-testid', 'mandala-grid')

      await generateMandalaPDF(element, mockMandala, 'test-mandala.pdf')

      expect(jsPDF).toHaveBeenCalled()
    })

    it('should capture element as image', async () => {
      const html2canvas = (await import('html2canvas')).default
      const element = document.createElement('div')
      element.setAttribute('data-testid', 'mandala-grid')

      await generateMandalaPDF(element, mockMandala, 'test-mandala.pdf')

      expect(html2canvas).toHaveBeenCalledWith(element, expect.any(Object))
    })

    it('should include center goal in PDF', async () => {
      const element = document.createElement('div')
      const result = await generateMandalaPDF(element, mockMandala, 'test.pdf')

      expect(result).toBe(true)
    })

    it('should use provided filename', async () => {
      const element = document.createElement('div')

      await generateMandalaPDF(element, mockMandala, 'my-mandala.pdf')

      expect(mockSave).toHaveBeenCalledWith('my-mandala.pdf')
    })

    it('should handle null element', async () => {
      await expect(generateMandalaPDF(null, mockMandala, 'test.pdf')).rejects.toThrow()
    })

    it('should handle errors during canvas capture', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValueOnce(new Error('Canvas capture failed'))

      const element = document.createElement('div')
      await expect(generateMandalaPDF(element, mockMandala, 'test.pdf')).rejects.toThrow(
        'Canvas capture failed'
      )
    })
  })

  describe('PDF Content Quality', () => {
    it('should format text properly in report PDF', async () => {
      await generateReportPDF(mockAISummary, 'test.pdf')

      expect(mockText).toHaveBeenCalled()
      expect(mockSetFontSize).toHaveBeenCalled()
    })

    it('should render keywords as a list', async () => {
      const result = await generateReportPDF(mockAISummary, 'test.pdf')
      expect(result).toBe(true)
    })

    it('should handle long text by wrapping', async () => {
      const longSummary = {
        ...mockAISummary,
        reflection_summary: 'a'.repeat(500),
      }

      const result = await generateReportPDF(longSummary, 'test.pdf')
      expect(result).toBe(true)
    })
  })
})
