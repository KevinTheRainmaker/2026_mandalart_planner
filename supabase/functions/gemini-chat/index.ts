import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  action: 'generateQuestion' | 'generateGoalSuggestion' | 'generateReport' | 'generateRecommendations'
  payload: Record<string, unknown>
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Model configurations
const MODELS = {
  flash: "google/gemini-3-flash-preview",
  pro: "google/gemini-3-pro-preview",
  // liquid: "liquid/lfm-2.5-1.2b-thinking:free",
  flash: "openai/gpt-5-mini",
  nano: "openai/gpt-5-nano",
  gpt5: "openai/gpt-5.1"
}

// Temperature configurations for each action type
const TEMPERATURES = {
  generateQuestion: 0.8,      // More creative for natural conversation
  generateGoalSuggestion: 0.7, // Balanced creativity and coherence
  generateReport: 0.5,         // More focused and analytical
  generateRecommendations: 0.6 // Balanced for diverse yet relevant suggestions
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number = 0.7
): Promise<string> {
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  }

  const payload = {
    model,
    messages: [{ role: "user", content: prompt }],
    stream: true,
    temperature
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  // Handle streaming response
  let fullContent = ""
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  if (!reader) {
    throw new Error("No response body")
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    while (true) {
      const lineEnd = buffer.indexOf('\n')
      if (lineEnd === -1) break

      const line = buffer.slice(0, lineEnd).trim()
      buffer = buffer.slice(lineEnd + 1)

      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') break

        try {
          const dataObj = JSON.parse(data)
          const content = dataObj.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
          }
        } catch {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }
  }

  return fullContent
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    const { action, payload } = await req.json() as ChatRequest

    let result: unknown

    switch (action) {
      case 'generateQuestion':
        result = await handleGenerateQuestion(apiKey, payload)
        break
      case 'generateGoalSuggestion':
        result = await handleGoalSuggestion(apiKey, payload)
        break
      case 'generateReport':
        result = await handleGenerateReport(apiKey, payload)
        break
      case 'generateRecommendations':
        result = await handleGenerateRecommendations(apiKey, payload)
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
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ question: string; summary?: string }> {
  const { theme, themeTitle, baseQuestion, previousAnswers, isFirstQuestion, totalQuestions } = payload as {
    theme: string
    themeTitle: string
    baseQuestion: string
    previousAnswers: { question: string; answer: string }[]
    isFirstQuestion: boolean
    totalQuestions: number
  }

  const conversationHistory = previousAnswers
    .map((qa, i) => `질문 ${i + 1}: ${qa.question}\n답변: ${qa.answer}`)
    .join('\n\n')

  const firstQuestionInstruction = isFirstQuestion 
    ? `첫 질문이니 친근하게 시작하면서, 총 ${totalQuestions}개의 질문을 드릴 예정이라고 자연스럽게 안내해주세요.`
    : '이전 답변 내용을 자연스럽게 연결하거나 언급해주세요.'

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
2. ${firstQuestionInstruction}
3. 질문은 하나만 해주세요.
4. 반말 대신 존댓말을 사용하세요.

응답 형식 (JSON):
{
  "summary": "${previousAnswers.length > 0 ? '이전 답변에 대한 1-2문장 공감/요약' : `사용자의 회고에 공감하며 친근하게 인사를 건네고, 총 ${totalQuestions}개의 질문을 드릴 예정임을 안내해주세요.`}",
  "question": "자연스럽게 변형된 질문"
}`

  const text = await callOpenRouter(apiKey, MODELS.flash, prompt, TEMPERATURES.generateQuestion)

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
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ suggestion: string; reasoning: string }> {
  const { themeTitle, reflectionSummary } = payload as {
    themeTitle: string
    reflectionSummary: string
  }

  const prompt = `당신은 사용자의 삶을 기획하는 '수석 라이프 전략가(Chief Life Strategist)'입니다. 사용자가 "${themeTitle}"라고 2025년을 회고했습니다.

당신의 임무는 회고 내용을 분석하여, 2026년 사용자의 삶을 지탱할 **가장 본질적이고 명확한 '중심 테마(Central Theme)'** 하나를 정의하는 것입니다.
이 테마는 만다라트 계획표의 정중앙에 위치하여, 8개의 하위 영역으로 확장될 수 있는 **단단한 구심점**이어야 합니다.

## 회고 내용:
${reflectionSummary}

## 목표 도출 절차 (Think Step by Step)
1) **[방향성 탐지] 에너지 벡터(Vector) 확인**
   - 사용자의 회고 전반을 바탕으로 2026년의 지향점을 파악하세요. 마지막 질문에 대한 답변이 가장 많은 정보를 담고 있을 수 있습니다.
   - 분류: '가속(Growth)', '회복(Rest)', '전환(Pivot)', '유지(Sustain)'
   - *지침: 과거가 힘들었더라도(감정), 사용자가 '더 달리고 싶다'고 했다면(의지), '의지'에 가중치를 두어 '가속'으로 판단해야 합니다.*

2) **[문제 정의] 핵심 병목(Bottleneck) 혹은 욕구 발견**
   - 회고에서 반복되는 패턴 중, 다음 단계로 나아가는 데 가장 방해가 되거나(병목), 가장 갈급한 것(욕구) **단 하나**를 찾으세요.
   - (예: 열심히 했지만 체력/방향성이 부족했다 → 구조적 시스템이 필요함)

3) **[전략 수립] 'One Big Thing' 레버(Lever) 선택**
   - 2번에서 찾은 병목을 해결하거나 욕구를 충족시키기 위해 2026년에 건드려야 할 **가장 큰 변화의 축**을 결정하세요.
   - 단순한 행동(무엇을 하기)이 아니라, 삶의 구조를 바꾸는 **키워드**여야 합니다.

4) **[네이밍] 테마 정의 (가장 중요)**
   - 선택된 레버를 **2026년을 관통하는 '제목'**으로 만드세요.
   - 아래의 [권장 네이밍 패턴] 중 사용자의 상황에 가장 적합한 형식을 선택하세요.

   **[권장 네이밍 패턴 & 예시]**
   * **균형/조화형 (A와 B)**: 서로 다른 두 가치를 동시에 잡아야 할 때
     - 예: "임상 전문성 및 신체 완성", "일상 주도권과 에너지 자립"
   * **페르소나/결과형 (Defined Outcome)**: 명확한 성취 목표가 있을 때
     - 예: "시장가치 2배 핵심인재", "연봉 1억 브랜드 오너", "8구단 드래프트 1순위"
   * **미션/과업형 (Mission Statement)**: 구체적인 행동 과정 자체가 목표일 때
     - 예: "더욱 더 나 다운 삶을 만들기", "지속 가능한 루틴 구축하기"
   * **빅 이벤트형 (Project Base)**: 특정 사건이 한 해를 지배할 때
     - 예: "아내와 함께 평생 추억을 만드는 여행"

5) **[검증] 만다라트 확장성 테스트**
   - 도출된 목표를 중앙에 두었을 때, 8개의 하위 영역(건강, 재무, 커리어, 관계, 멘탈 등)으로 자연스럽게 파생되는지 점검하세요.
   - 만약 특정 영역(예: 일)에만 너무 치우쳐 있다면, 문구를 조금 더 상위 개념으로 다듬으세요.

## 요청:
회고 내용을 분석하여 2026년에 가장 중요한 **하나의 핵심 목표**를 도출하세요.

### 목표 품질 기준(Strict Rules)
- 목표는 명확한 **결과(Outcome)** 중심의 상태 변화여야 합니다.
- "행복한 한 해 보내기"처럼 두루뭉술한 표현을 **절대 금지**합니다.
- 15자 이내의 한 문장으로 간결하되, 2026년 전체를 관통하는 중심축이며, 현실적으로 달성 가능해야 합니다.
- 회고에서 드러난 니즈/가치와의 **논리적 연결**이 분명해야 합니다.
- 목표는 이후 하위 목표 8개를 만들 수 있는 "중심축"이어야 합니다.

### 응답 형식 (JSON):
{
  "suggestion": "2026년 핵심 목표 1 phrase (공백 포함 15자 이내, 권장 네이밍 패턴 참고)",
  "reasoning": "회고의 패턴과 핵심 레버를 근거로 이 목표를 제안한 이유를 150자 이내의 존댓말로 설명"
}`

  const text = await callOpenRouter(apiKey, MODELS.flash, prompt, TEMPERATURES.generateGoalSuggestion)

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
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{
  reflection_summary: string
  goal_analysis: string
  keywords: string[]
  insights: string
}> {
  const { mandala } = payload as { mandala: Record<string, unknown> }

  const prompt = `당신은 만다라트(Mandala Chart) 기법에 정통한 전문 목표 코치입니다.
사용자의 만다라트 계획을 분석하여, 이미 잘 설계된 부분은 명확히 짚고, 필요한 경우에만 과하지 않은 개선 방향을 제안해주세요.

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
2. 하위 목표들이 핵심 목표를 서로 다른 관점에서 보완하며 과도한 중복 없이 구성되어 있는지 분석하세요.
3. 액션 플랜이 각 하위 목표의 의도를 잘 반영하고 있는지, 실행 수준에서 지나치게 추상적이지 않은지 점검하세요.
4. 전체 계획을 SMART(Specific, Measurable, Achievable, Relevant, Time-bound) 기준으로 해석하고, 그 강점과 약점을 분석 내용에 자연스럽게 반영하세요.
5. 잘 설계되어 유지하는 것이 좋은 부분과, 연결이 약해 보이거나 다듬으면 더 명확해질 부분을 구분해 서술하세요.
6. 개선 제안이 필요한 경우에만, **범위를 키우지 않고 표현·정렬·연결을 다듬는 수준의 조언**을 제공하세요.
7. 핵심 키워드는 만다라트 차트에 실제로 등장하는 표현 (핵심 목표, 하위 목표, 액션 플랜에 포함된 단어들)을 요약·대표하는 키워드입니다.
8. 키워드는 최대 5자 이내로 작성하세요.

## 응답 형식 (JSON, 형식 유지)
{
  "reflection_summary": "이 만다라트 계획이 담고 있는 사용자의 핵심 의도와 방향을 요약 (3-5문장)",
  "goal_analysis": "핵심 목표–하위 목표–액션 플랜의 구조적 정렬 상태와 SMART 관점의 강점·약점을 포함한 분석 (3-5문장)",
  "keywords": ["만다라트에 실제 등장한 핵심 키워드 1", "핵심 키워드 2", "핵심 키워드 3"] (각 5자 이내),
  "insights": "유지하면 좋은 설계 요소와, 필요할 경우에만 고려해볼 수 있는 가벼운 개선 방향 제안 (3-5문장)"
}`

  const text = await callOpenRouter(apiKey, MODELS.gpt5, prompt, TEMPERATURES.generateReport)

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
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{
  recommendations: { text: string; reason: string }[]
}> {
  const { type, centerGoal, subGoal, existingItems, otherSubGoalsPlans } = payload as {
    type: 'subGoal' | 'actionPlan'
    centerGoal: string
    subGoal?: string
    existingItems?: string[]
    otherSubGoalsPlans?: { subGoal: string; plans: string[] }[]
  }

  const existingItemsText = existingItems?.length 
    ? `\n\n${existingItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
    : ''

  // 다른 하위 목표의 액션플랜 텍스트 생성
  const otherPlansText = otherSubGoalsPlans?.length
    ? otherSubGoalsPlans
        .filter(item => item.plans && item.plans.length > 0)
        .map(item => `[${item.subGoal}]: ${item.plans.join(', ')}`)
        .join('\n')
    : ''

  let prompt: string

  if (type === 'subGoal') {
    prompt = `당신은 하나의 핵심 목표를 '관리 가능한 전략적 하위 영역'으로 분해하는 목표 설계 전문가입니다.

당신의 역할은 **핵심 목표가 달성되기 위해 결정적으로 관리되어야 할 영역들을 구조적으로 도출하는 것**입니다.

## 핵심 목표
${centerGoal}

## 이전 하위 목표
다음은 이전에 작성한 하위 목표입니다. 아래와 유사한 스타일로, 겹치지 않게 추천해주세요.
${existingItemsText}

## 목표 해석 가이드 (중요)
- 핵심 목표는 하나의 **도달해야 할 결과 상태**입니다
- 하위 목표는 그 결과를 만들어내는 **조건, 역량, 성과 축, 또는 검증 요소**여야 합니다
- 하위 목표는 **'무엇이 갖춰져야 그 목표가 실현되는가'**의 관점에서 도출되어야 합니다

## 요청
위 핵심 목표를 달성하기 위해 반드시 관리되어야 할 서로 다른 하위 목표 3개를 추천해주세요.

### 작성 원칙 (중요)
- 하위 목표는 **행동·루틴·방법이 아닌 '관리 대상 영역 또는 성과 단위'**여야 합니다
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
당신의 역할은 목표를 '일상에서 무리 없이 할 수 있는 행동'으로 바꾸는 것입니다.
SMART 프레임워크를 참고하되, 행동 문구 자체는 자연스럽고 과하지 않게 설계하세요.

## 핵심 목표
${centerGoal}

## 해당 하위 목표
${subGoal}

## 이전 액션 플랜 (현재 하위 목표)
다음은 현재 하위 목표에서 이전에 작성한 액션 플랜입니다.
아래와 유사한 톤과 밀도로, 겹치지 않게 추천하세요.
${existingItemsText}
${otherPlansText ? `
## 다른 하위 목표의 액션 플랜 (참고용)
다음은 다른 하위 목표에서 이미 작성된 액션 플랜입니다.
**반드시 아래 액션플랜들과 중복되지 않도록** 추천해주세요.
${otherPlansText}
` : ''}
## 요청
위 하위 목표를 달성하기 위해 실행가능한 구체적인 액션플랜 3개를 추천해주세요.

### 작성 원칙 (중요)
- 각 액션플랜은 **한 번에 실행 가능한 단일 행동**
- 실행 여부를 **제3자가 확인 가능**
- **간결한 명사형**, 괄호 없이 작성
- **최대 20자 이내**
- 지나치게 관리적이거나 KPI처럼 느껴지지 않게 작성
- Macro한 행동 수준을 유지할 것 (예: 주 1회 등산, 아침 독서, 말보다 행동)
- **다른 하위 목표의 액션플랜과 중복되지 않도록 주의**

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
    const text = await callOpenRouter(apiKey, MODELS.flash, prompt, TEMPERATURES.generateRecommendations)

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
