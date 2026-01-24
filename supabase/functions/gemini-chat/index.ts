import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  action: 'generateQuestion' | 'generateGoalSuggestion' | 'generateReport' | 'generateRecommendations'
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
      case 'generateRecommendations':
        result = await handleGenerateRecommendations(genAI, payload)
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

당신의 임무는 ‘회고의 감정/사건’에서 바로 목표를 점프하지 않고, 회고에서 드러난 패턴과 니즈를 한 단계 추상화한 뒤, 2026년에 바꿀 핵심 레버(지렛대)를 정하고, 그 레버를 측정 가능한 Outcome 목표로 번역하는 것입니다.

## 회고 내용:
${reflectionSummary}

## 목표 도출 절차(반드시 따를 것)
1) 회고에서 반복되는 **문제/니즈/가치**를 2~3개로 압축한다.
2) 그중 2026년에 가장 큰 변화를 만들 **핵심 레버 1개**를 선택한다.
   - 레버는 “무엇을 더/덜 하겠다” 수준이 아니라, 2026년의 삶/일을 구조적으로 바꿀 수 있는 초점이어야 한다.
3) 선택한 레버를 **결과(Outcome) 중심 목표 1문장**으로 변환한다.
   - 측정 기준(수치/빈도/마감시점/완료조건) 중 최소 1개 포함
   - 너무 포괄적이면 안 됨(예: 행복해지기, 열정 찾기 금지)
   - 너무 미시적이면 안 됨(예: 앱 기능 1개 만들기 같은 단일 작업 금지)
4) 이 목표가 만다라트의 8개 영역으로 확장 가능한지 점검한다.
   - 확장 근거가 약하면 목표 문장을 더 명확하게 재작성한다.

## 요청:
회고 내용을 분석하여 2026년에 가장 중요한 **하나의 핵심 목표**를 도출하세요.

### 목표 품질 기준(중요)
- 목표는 명확한 **결과(Outcome)** 중심이어야 합니다(측정 또는 성취 기준 포함).
- 한 문장으로 간결해야 하며, 현실적으로 달성 가능해야 합니다.
- 회고에서 드러난 니즈/가치와의 **인과적 연결(왜 이게 2026의 1순위인지)**이 드러나야 합니다.
- 목표는 이후 하위 목표 8개를 만들 수 있는 “중심축”이어야 합니다.
- reason에는 ‘회고 → 레버 선택 → 목표’ 흐름이 보이게 2~3문장으로 설명하세요 (감정 위로가 아니라 논리적 근거 중심).

### 주의
- 회고 테마("${themeTitle}")의 맥락을 반영하되, 과하게 테마에 얽매이지 마세요.
- 조언/방법론/세부 실행계획을 길게 쓰지 마세요(하위 목표에서 다룰 내용입니다).

응답 형식 (JSON):
{
  "suggestion": "제안하는 핵심 목표 (예: 프로야구 8구단 드래프트 1순위)",
  "reasoning": "회고 내용과 만다라트 구조 기준에 기반한 제안 이유 (2-3문장)"
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

  const prompt = `당신은 만다라트(Mandala Chart) 기법에 정통한 전문 목표 코치입니다.
사용자의 만다라트 계획을 분석하고, 더 나은 계획으로 개선할 수 있도록
구체적이고 실행 가능한 피드백을 제공해주세요.

## 핵심 목표
${mandala.center_goal}

## 하위 목표
${(mandala.sub_goals as string[])?.map((g, i) => `${i + 1}. ${g}`).join('\n')}

## 액션 플랜
${Object.entries(mandala.action_plans as Record<string, string[]>)
  .map(([key, plans]) => `목표 ${parseInt(key) + 1}: ${plans.join(', ')}`)
  .join('\n')}

## 분석 요청
다음 기준에 따라 만다라트 계획을 분석하세요:

1. 핵심 목표가 만다라트의 중심 목표로서 충분히 명확하고 단일한지 평가하세요.
2. 하위 목표들이 핵심 목표를 서로 다른 관점에서 균형 있게 지지하고 있는지 분석하세요.
3. 액션 플랜이 각 하위 목표와 직접적으로 연결되어 있고 실행 수준으로 충분히 구체적인지 평가하세요.
4. 전체 계획을 SMART(Specific, Measurable, Achievable, Relevant, Time-bound) 기준으로 해석하고, 그 강점과 약점을 분석 내용에 자연스럽게 반영하세요.
5. 계획에서 잘 설계된 부분과, 과도하게 포괄적이거나 모호한 부분을 구분해 지적하세요.
6. 단순 해석이 아니라, **어디를 어떻게 수정하면 더 좋아질지**가 드러나는 피드백을 제공하세요.

## 응답 형식 (JSON, 형식 유지)
{
  "reflection_summary": "이 만다라트 계획이 담고 있는 사용자의 핵심 의도와 방향을 요약 (3-5문장)",
  "goal_analysis": "핵심 목표–하위 목표–액션 플랜의 구조적 정렬 상태와 SMART 관점의 강점·약점을 포함한 분석 (3-5문장)",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "insights": "이 만다라트 플래너를 한 단계 더 개선하기 위해 지금 수정하면 좋은 방향과 구체적 조언 (3-5문장)"
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

async function handleGenerateRecommendations(
  genAI: GoogleGenerativeAI,
  payload: Record<string, unknown>
): Promise<{
  recommendations: { text: string; reason: string }[]
}> {
  const { type, centerGoal, subGoal, existingItems } = payload as {
    type: 'subGoal' | 'actionPlan'
    centerGoal: string
    subGoal?: string
    existingItems?: string[]
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const existingItemsText = existingItems?.length 
    ? `\n\n${existingItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
    : ''

  let prompt: string

  if (type === 'subGoal') {
    prompt = `당신은 하나의 핵심 목표를 ‘관리 가능한 전략적 하위 영역’으로 분해하는 목표 설계 전문가입니다.

당신의 역할은 **핵심 목표가 달성되기 위해 결정적으로 관리되어야 할 영역들을 구조적으로 도출하는 것**입니다.

## 핵심 목표
${centerGoal}

## 이전 하위 목표
다음은 이전에 작성한 하위 목표입니다. 아래와 유사한 스타일로, 겹치지 않게 추천해주세요.
${existingItemsText}

## 목표 해석 가이드 (중요)
- 핵심 목표는 하나의 **도달해야 할 결과 상태**입니다
- 하위 목표는 그 결과를 만들어내는 **조건, 역량, 성과 축, 또는 검증 요소**여야 합니다
- 하위 목표는 **‘무엇이 갖춰져야 그 목표가 실현되는가’**의 관점에서 도출되어야 합니다

## 요청
위 핵심 목표를 달성하기 위해 반드시 관리되어야 할 서로 다른 하위 목표 3개를 추천해주세요.

### 작성 원칙 (중요)
- 하위 목표는 **행동·루틴·방법이 아닌 ‘관리 대상 영역 또는 성과 단위’**여야 합니다
- 각 하위 목표는 핵심 목표 달성에 **독립적으로 중요한 역할**을 해야 합니다
- 세 하위 목표는 서로 **중복되지 않는 다른 관점**을 가져야 합니다
- 하위 목표를 달성했을 때, 핵심 목표 달성 가능성이 **논리적으로 명확히 증가**해야 합니다
- 간결한 명사형 표현을 사용하고, 괄호 없이 작성하세요
- 하위 목표는 최대 10자 이내로 작성하세요
- Macro한 형태로 작성하세요 (예시: 건강한 몸, 자산 불리기, 도전하는 삶)

### 응답 형식 (JSON)
{
  "recommendations": [
    {
      "text": "하위 목표 1 (최대 10자)",
      "reason": "이 목표가 핵심 목표 달성에 결정적으로 중요한 이유 설명"
    },
    {
      "text": "하위 목표 2 (최대 10자)",
      "reason": "이 목표가 핵심 목표 달성에 결정적으로 중요한 이유 설명"
    },
    {
      "text": "하위 목표 3 (최대 10자)",
      "reason": "이 목표가 핵심 목표 달성에 결정적으로 중요한 이유 설명"
    }
  ]
}`
  } else {
    prompt = `당신은 목표를 실제 행동으로 전환하는 실행 설계 코치입니다.
당신의 역할은 목표를 ‘일상에서 무리 없이 할 수 있는 행동’으로 바꾸는 것입니다.
SMART 프레임워크를 참고하되, 행동 문구 자체는 자연스럽고 과하지 않게 설계하세요.

## 핵심 목표
${centerGoal}

## 해당 하위 목표
${subGoal}

## 이전 액션 플랜
다음은 이전에 작성한 액션 플랜입니다.
아래와 유사한 톤과 밀도로, 겹치지 않게 추천하세요.
${existingItemsText}

## 요청
위 하위 목표를 달성하기 위해 실행가능한 구체적인 액션플랜 3개를 추천해주세요.

### 작성 원칙 (중요)
- 각 액션플랜은 **한 번에 실행 가능한 단일 행동**
- 실행 여부를 **제3자가 확인 가능**
- **간결한 명사형**, 괄호 없이 작성
- **최대 20자 이내**
- 지나치게 관리적이거나 KPI처럼 느껴지지 않게 작성
- Macro한 행동 수준을 유지할 것 (예: 주 1회 등산, 아침 독서, 말보다 행동)

### SMART 기준 적용
액션플랜은 다음 SMART 기준을 고려하여 작성해야 합니다:
- **S** (Specific): 무엇을 어떻게 할지 명확히 드러날 것
- **M** (Measurable): 완료 여부를 체크할 수 있을 것
- **A** (Achievable): 일상에서 실행 가능한 수준으로 설정
- **R** (Relevant): 해당 하위 목표에 직접적으로 기여
- **T** (Time-bound): 빈도, 기간, 시점 중 최소 하나 이상 포함

### SMART 기준 활용 방식
- SMART는 **액션의 타당성을 판단하기 위한 내부 기준**입니다
- 액션플랜 문구 자체에 숫자·기간·조건을 과도하게 노출하지 마세요
- 시간 요소는 빈도, 루틴성, 반복 가능성 중 하나만 암묵적으로 드러나도 충분합니다

### 응답 형식 (JSON)
{
  "recommendations": [
    {
      "text": "액션플랜 1 (최대 20자)",
      "reason": "이 행동이 하위 목표 달성에 효과적인 이유와 SMART 충족 요소 설명"
    },
    {
      "text": "액션플랜 2 (최대 20자)",
      "reason": "이 행동이 하위 목표 달성에 효과적인 이유와 SMART 충족 요소 설명"
    },
    {
      "text": "액션플랜 3 (최대 20자)",
      "reason": "이 행동이 하위 목표 달성에 효과적인 이유와 SMART 충족 요소 설명"
    }
  ]
}`
  }

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { recommendations: [] }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      recommendations: parsed.recommendations || [],
    }
  } catch (error) {
    console.error('Recommendation generation failed:', error)
    return { recommendations: [] }
  }
}
