import { supabase } from '@/lib/supabase'
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
 * Call Supabase Edge Function for Gemini API
 */
async function callGeminiFunction(
  action: 'generateQuestion' | 'generateGoalSuggestion' | 'generateReport',
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke('gemini-chat', {
    body: { action, payload },
  })

  if (error) {
    console.error('Edge function error:', error)
    throw error
  }

  return data
}

/**
 * Generate the next question in the reflection flow
 * Uses base questions from themes but naturally transforms them with LLM
 */
export async function generateNextQuestion(
  context: ChatContext
): Promise<QuestionResponse> {
  const theme = REFLECTION_THEMES[context.theme]
  const baseQuestion = theme.questions[context.currentQuestionIndex]

  // If no more questions, return completion message
  if (!baseQuestion) {
    return {
      question: '모든 회고 질문이 완료되었습니다. 다음 단계로 진행하시겠어요?',
    }
  }

  try {
    const result = await callGeminiFunction('generateQuestion', {
      theme: context.theme,
      themeTitle: theme.title,
      baseQuestion,
      previousAnswers: context.previousAnswers,
      isFirstQuestion: context.previousAnswers.length === 0,
    })

    return {
      question: (result.question as string) || baseQuestion,
      summary: result.summary as string | undefined,
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
  const theme = REFLECTION_THEMES[reflectionTheme]

  // Build reflection summary
  const reflectionSummary = Object.entries(reflectionAnswers)
    .map(([key, answer], i) => {
      const question = theme.questions[parseInt(key)] || `질문 ${i + 1}`
      return `Q: ${question}\nA: ${answer}`
    })
    .join('\n\n')

  try {
    const result = await callGeminiFunction('generateGoalSuggestion', {
      themeTitle: theme.title,
      reflectionSummary,
    })

    return {
      suggestion: (result.suggestion as string) || '',
      reasoning: (result.reasoning as string) || '회고 내용을 바탕으로 목표를 제안드립니다.',
    }
  } catch (error) {
    console.error('Goal suggestion generation failed:', error)
    return {
      suggestion: '',
      reasoning: '회고 내용을 바탕으로 올해의 핵심 목표를 설정해보세요.',
    }
  }
}
