import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  action: 'generateQuestion' | 'generateGoalSuggestion' | 'generateReport'
  payload: Record<string, unknown>
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const { action, payload } = await req.json() as ChatRequest

    let result: unknown

    switch (action) {
      case 'generateQuestion':
        result = await handleGenerateQuestion(genAI, payload)
        break
      case 'generateGoalSuggestion':
        result = await handleGoalSuggestion(genAI, payload)
        break
      case 'generateReport':
        result = await handleGenerateReport(genAI, payload)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGenerateQuestion(
  genAI: GoogleGenerativeAI,
  payload: Record<string, unknown>
): Promise<{ question: string; summary?: string }> {
  const { theme, themeTitle, baseQuestion, previousAnswers, isFirstQuestion } = payload as {
    theme: string
    themeTitle: string
    baseQuestion: string
    previousAnswers: { question: string; answer: string }[]
    isFirstQuestion: boolean
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const conversationHistory = previousAnswers
    .map((qa, i) => `질문 ${i + 1}: ${qa.question}\n답변: ${qa.answer}`)
    .join('\n\n')

  const prompt = `당신은 친근하고 공감적인 회고 코치입니다. 사용자가 "${themeTitle}"라고 2025년을 회고하고 있습니다.

${previousAnswers.length > 0 ? `## 이전 대화:
${conversationHistory}

## 이전 답변 요약 (1-2문장):
사용자의 이전 답변을 간단히 요약하고 공감해주세요.
` : ''}

## 다음 질문 (원본):
"${baseQuestion}"

## 요청:
1. 원본 질문의 의도를 유지하면서 자연스럽고 따뜻하게 변형해주세요.
2. ${previousAnswers.length > 0 ? '이전 답변 내용을 자연스럽게 연결하거나 언급해주세요.' : '첫 질문이니 친근하게 시작해주세요.'}
3. 질문은 하나만 해주세요.
4. 반말 대신 존댓말을 사용하세요.

응답 형식 (JSON):
{
  "summary": "${previousAnswers.length > 0 ? '이전 답변에 대한 1-2문장 공감/요약' : '사용자의 회고에 공감하며 친근하게 인사를 건네주세요.'}",
  "question": "자연스럽게 변형된 질문"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { question: baseQuestion }
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    question: parsed.question || baseQuestion,
    summary: parsed.summary,
  }
}

async function handleGoalSuggestion(
  genAI: GoogleGenerativeAI,
  payload: Record<string, unknown>
): Promise<{ suggestion: string; reasoning: string }> {
  const { themeTitle, reflectionSummary } = payload as {
    themeTitle: string
    reflectionSummary: string
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

  const prompt = `당신은 전문 목표 설정 코치입니다. 사용자가 "${themeTitle}"라고 2025년을 회고했습니다.

## 회고 내용:
${reflectionSummary}

## 요청:
사용자의 회고 내용을 분석하여 2026년 핵심 목표를 제안해주세요.

1. 회고에서 드러난 사용자의 니즈와 가치를 파악하세요.
2. 구체적이면서도 의미 있는 목표 1-2개를 제안하세요.
3. 왜 이 목표를 제안하는지 간단히 설명해주세요.
4. 핵심 목표는 '가장 이루고 싶은 1년 목표'의 형태여야 합니다.

응답 형식 (JSON):
{
  "suggestion": "제안하는 핵심 목표 (예: 프로야구 구단 드래프트 1순위)",
  "reasoning": "회고 내용을 바탕으로 이 목표를 제안하는 이유 (2-3문장)"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      suggestion: '',
      reasoning: '회고 내용을 바탕으로 올해의 핵심 목표를 설정해보세요.',
    }
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    suggestion: parsed.suggestion || '',
    reasoning: parsed.reasoning || '회고 내용을 바탕으로 목표를 제안드립니다.',
  }
}

async function handleGenerateReport(
  genAI: GoogleGenerativeAI,
  payload: Record<string, unknown>
): Promise<{
  reflection_summary: string
  goal_analysis: string
  keywords: string[]
  insights: string
}> {
  const { mandala } = payload as { mandala: Record<string, unknown> }

  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

  const prompt = `당신은 전문 목표 코치입니다. 사용자의 만다라트 계획을 분석해주세요.

## 핵심 목표
${mandala.center_goal}

## 하위 목표
${(mandala.sub_goals as string[])?.map((g, i) => `${i + 1}. ${g}`).join('\n')}

## 액션 플랜
${Object.entries(mandala.action_plans as Record<string, string[]>)
  .map(([key, plans]) => `목표 ${parseInt(key) + 1}: ${plans.join(', ')}`)
  .join('\n')}

다음 형식으로 분석해주세요:

{
  "reflection_summary": "회고 요약 (3-5문장)",
  "goal_analysis": "목표 구조 분석 (3-5문장)",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "insights": "종합 인사이트 및 조언 (3-5문장)"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      reflection_summary: '분석을 완료할 수 없습니다.',
      goal_analysis: '',
      keywords: [],
      insights: '',
    }
  }

  return JSON.parse(jsonMatch[0])
}
