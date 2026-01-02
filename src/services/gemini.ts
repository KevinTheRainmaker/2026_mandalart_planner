import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Mandala, AISummary } from '@/types'

export async function generateAIReport(mandala: Mandala): Promise<AISummary> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  // Using gemini-pro for stable API access
  // Alternative models: 'gemini-1.5-flash', 'gemini-1.5-flash-latest'
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
당신은 전문 목표 설정 코치입니다. 사용자가 14일 동안 작성한 만다라트 목표 설정 데이터를 분석하여 종합 리포트를 생성해주세요.

## 입력 데이터:

### 회고 (Day 1-2):
- 선택 테마: ${mandala.reflection_theme}
- 회고 답변: ${JSON.stringify(mandala.reflection_answers, null, 2)}
- 회고 노트: ${mandala.reflection_notes}

### 목표 설정 (Day 3-13):
- 중심 목표: ${mandala.center_goal}
- 하위 목표 (8개): ${mandala.sub_goals.join(', ')}
- 액션플랜: ${JSON.stringify(mandala.action_plans, null, 2)}

## 분석 요청사항:

다음 항목들을 분석하여 JSON 형식으로 답변해주세요:

1. **reflection_summary**: 회고 요약 (100-150자)
   - 선택한 테마의 의미
   - 주요 감정 키워드 2-3개
   - 반복되는 패턴 1-2가지

2. **goal_analysis**: 목표 구조 분석 (150-200자)
   - 중심 목표와 하위 목표의 연관성 평가
   - 액션플랜의 구체성 평가
   - 실행 가능성 인사이트

3. **keywords**: 전체 텍스트에서 추출한 핵심 키워드 5-7개 (배열)

4. **insights**: 통합 인사이트 및 추천사항 (200-250자)
   - 회고와 목표의 일관성
   - 강점과 개선 포인트
   - 구체적 추천사항 1-2가지

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "reflection_summary": "...",
  "goal_analysis": "...",
  "keywords": ["키워드1", "키워드2", ...],
  "insights": "..."
}
`

  try {
    console.log('Generating AI report with Gemini API...')
    console.log('API Key configured:', !!apiKey)

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log('Gemini API response received')
    console.log('Response text:', text.substring(0, 200) + '...')

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to extract JSON from response:', text)
      throw new Error('Failed to parse AI response - no JSON found in response')
    }

    const aiSummary: AISummary = JSON.parse(jsonMatch[0])

    // Validate response structure
    if (
      !aiSummary.reflection_summary ||
      !aiSummary.goal_analysis ||
      !aiSummary.keywords ||
      !aiSummary.insights
    ) {
      console.error('Invalid AI response structure:', aiSummary)
      throw new Error('Invalid AI response structure - missing required fields')
    }

    console.log('AI report generated successfully')
    return aiSummary
  } catch (error) {
    console.error('Error generating AI report:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      throw new Error(`Failed to generate AI report: ${error.message}`)
    }
    throw new Error('Failed to generate AI report - unknown error')
  }
}
