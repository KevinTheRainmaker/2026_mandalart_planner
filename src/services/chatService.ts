import { GoogleGenerativeAI } from '@google/generative-ai'
import { REFLECTION_THEMES } from '@/constants'
import type { ReflectionThemeKey, ReflectionAnswers } from '@/types'

interface ChatContext {
  theme: ReflectionThemeKey
  currentQuestionIndex: number
  previousAnswers: { question: string; answer: string }[]
}

interface QuestionResponse {
  question: string
  summary?: string
}

interface GoalSuggestionResponse {
  suggestion: string
  reasoning: string
}

/**
 * Generate the next question in the reflection flow
 * Uses base questions from themes but naturally transforms them with LLM
 */
export async function generateNextQuestion(
  context: ChatContext
): Promise<QuestionResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    // Fallback to static questions if no API key
    const theme = REFLECTION_THEMES[context.theme]
    return {
      question: theme.questions[context.currentQuestionIndex] || '회고가 완료되었습니다.',
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const theme = REFLECTION_THEMES[context.theme]
  const baseQuestion = theme.questions[context.currentQuestionIndex]

  // If no more questions, return completion message
  if (!baseQuestion) {
    return {
      question: '모든 회고 질문이 완료되었습니다. 다음 단계로 진행하시겠어요?',
    }
  }

  // Build conversation summary
  const conversationHistory = context.previousAnswers
    .map((qa, i) => `질문 ${i + 1}: ${qa.question}\n답변: ${qa.answer}`)
    .join('\n\n')

  const prompt = `당신은 친근하고 공감적인 회고 코치입니다. 사용자가 "${theme.title}" 테마로 2025년을 회고하고 있습니다.

${context.previousAnswers.length > 0 ? `## 이전 대화:
${conversationHistory}

## 이전 답변 요약 (1-2문장):
사용자의 이전 답변을 간단히 요약하고 공감해주세요.
` : ''}

## 다음 질문 (원본):
"${baseQuestion}"

## 요청:
1. 원본 질문의 의도를 유지하면서 자연스럽고 따뜻하게 변형해주세요.
2. ${context.previousAnswers.length > 0 ? '이전 답변 내용을 자연스럽게 연결하거나 언급해주세요.' : '첫 질문이니 친근하게 시작해주세요.'}
3. 질문은 하나만 해주세요.
4. 반말 대신 존댓말을 사용하세요.

응답 형식 (JSON):
{
  "summary": "${context.previousAnswers.length > 0 ? '이전 답변에 대한 1-2문장 공감/요약' : ''}",
  "question": "자연스럽게 변형된 질문"
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to parse LLM response, using fallback:', text)
      return { question: baseQuestion }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      question: parsed.question || baseQuestion,
      summary: parsed.summary,
    }
  } catch (error) {
    console.error('LLM question generation failed:', error)
    // Fallback to static question
    return { question: baseQuestion }
  }
}

/**
 * Generate goal suggestion based on reflection answers
 */
export async function generateGoalSuggestion(
  reflectionTheme: ReflectionThemeKey,
  reflectionAnswers: ReflectionAnswers
): Promise<GoalSuggestionResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return {
      suggestion: '',
      reasoning: '회고 내용을 바탕으로 올해의 핵심 목표를 설정해보세요.',
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const theme = REFLECTION_THEMES[reflectionTheme]
  
  // Build reflection summary
  const reflectionSummary = Object.entries(reflectionAnswers)
    .map(([key, answer], i) => {
      const question = theme.questions[parseInt(key)] || `질문 ${i + 1}`
      return `Q: ${question}\nA: ${answer}`
    })
    .join('\n\n')

  const prompt = `당신은 전문 목표 설정 코치입니다. 사용자가 "${theme.title}" 테마로 2025년을 회고했습니다.

## 회고 내용:
${reflectionSummary}

## 요청:
사용자의 회고 내용을 분석하여 2026년 핵심 목표를 제안해주세요.

1. 회고에서 드러난 사용자의 니즈와 가치를 파악하세요.
2. 구체적이면서도 의미 있는 목표 1-2개를 제안하세요.
3. 왜 이 목표를 제안하는지 간단히 설명해주세요.

응답 형식 (JSON):
{
  "suggestion": "제안하는 핵심 목표 (예: 건강한 워라밸 만들기)",
  "reasoning": "회고 내용을 바탕으로 이 목표를 제안하는 이유 (2-3문장)"
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to parse goal suggestion response:', text)
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
  } catch (error) {
    console.error('Goal suggestion generation failed:', error)
    return {
      suggestion: '',
      reasoning: '회고 내용을 바탕으로 올해의 핵심 목표를 설정해보세요.',
    }
  }
}
