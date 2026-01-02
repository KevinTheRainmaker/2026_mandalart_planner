import { useState, useEffect } from 'react'
import { Button, Textarea } from '@/components/common'
import { REFLECTION_THEMES, THEME_KEYS, REFLECTION_ANSWER_MAX_LENGTH } from '@/constants'
import type { Mandala, ReflectionThemeKey, ReflectionAnswers } from '@/types'

interface Day1ReflectionProps {
  mandala: Mandala
  onSave: (data: {
    reflection_theme: ReflectionThemeKey
    reflection_answers: ReflectionAnswers
  }) => void
}

export function Day1Reflection({ mandala, onSave }: Day1ReflectionProps) {
  const [selectedTheme, setSelectedTheme] = useState<ReflectionThemeKey | null>(
    mandala.reflection_theme
  )
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showThemeSelection, setShowThemeSelection] = useState(
    !mandala.reflection_theme
  )
  const [currentStep, setCurrentStep] = useState(0)

  // Restore previous answers when component mounts or theme changes
  useEffect(() => {
    if (selectedTheme && Object.keys(mandala.reflection_answers).length > 0) {
      // Convert ReflectionAnswers (string keys) to Record<number, string> (number keys)
      const answerObj: Record<number, string> = {}
      Object.entries(mandala.reflection_answers).forEach(([key, value]) => {
        const numKey = parseInt(key, 10)
        if (!isNaN(numKey)) {
          answerObj[numKey] = value
        }
      })
      setAnswers(answerObj)
    } else {
      setAnswers({})
    }
  }, [selectedTheme, mandala.reflection_answers])

  const handleThemeSelect = (themeKey: ReflectionThemeKey) => {
    setSelectedTheme(themeKey)
    setShowThemeSelection(false)
    setAnswers({})
  }

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }))
  }

  const handleChangeTheme = () => {
    setShowThemeSelection(true)
  }

  const handleSave = () => {
    if (!selectedTheme) return

    // Convert Record<number, string> to ReflectionAnswers (string keys)
    const reflectionAnswers: ReflectionAnswers = {}
    Object.entries(answers).forEach(([key, value]) => {
      reflectionAnswers[key] = value
    })

    onSave({
      reflection_theme: selectedTheme,
      reflection_answers: reflectionAnswers,
    })
  }

  // Check if all questions have been answered (at least 1 character)
  const theme = selectedTheme ? REFLECTION_THEMES[selectedTheme] : null
  const totalQuestions = theme?.questions.length || 0

  const allQuestionsAnswered =
    selectedTheme !== null &&
    totalQuestions > 0 &&
    Array.from({ length: totalQuestions }).every((_, idx) =>
      answers[idx] && answers[idx].trim().length > 0
    )

  const currentAnswerValid = answers[currentStep] && answers[currentStep].trim().length > 0

  if (showThemeSelection) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            2025년 회고
          </h1>
          <p className="text-gray-600">
            아래 테마 중 하나를 선택하고 질문에 답변해주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {THEME_KEYS.map((themeKey) => {
            const theme = REFLECTION_THEMES[themeKey]
            return (
              <div
                key={themeKey}
                className="border-2 border-gray-200 rounded-lg p-8 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                onClick={() => handleThemeSelect(themeKey)}
              >
                <h3 className="font-semibold text-xl text-gray-900">
                  {theme.title}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!selectedTheme || !theme) return null

  const currentQuestion = theme.questions[currentStep]
  const isLastQuestion = currentStep === totalQuestions - 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            2025년 회고
          </h1>
          <h2 className="text-xl font-semibold text-primary-700 mb-2">
            {theme.title}
          </h2>
        </div>
        <Button variant="outline" onClick={handleChangeTheme}>
          테마 변경
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">
          질문 {currentStep + 1} / {totalQuestions}
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <label className="block font-medium text-gray-900 text-lg">
          {currentStep + 1}. {currentQuestion}
        </label>
        <Textarea
          value={answers[currentStep] || ''}
          onChange={(e) => handleAnswerChange(currentStep, e.target.value)}
          placeholder="자유롭게 답변해주세요..."
          rows={8}
          maxLength={REFLECTION_ANSWER_MAX_LENGTH}
          autoFocus
        />
        <div className="text-sm text-gray-500 text-right">
          {(answers[currentStep] || '').length} / {REFLECTION_ANSWER_MAX_LENGTH}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          이전 질문
        </Button>

        {!isLastQuestion ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!currentAnswerValid}
          >
            다음 질문
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={!allQuestionsAnswered}
            size="lg"
          >
            저장하고 계속하기
          </Button>
        )}
      </div>
    </div>
  )
}
