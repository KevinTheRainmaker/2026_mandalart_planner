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

  const isSaveEnabled =
    selectedTheme !== null &&
    Object.values(answers).some((answer) => answer.trim().length > 0)

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
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
                onClick={() => handleThemeSelect(themeKey)}
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-3">
                  {theme.title}
                </h3>
                <ul className="space-y-2">
                  {theme.questions.map((question, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {question}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!selectedTheme) return null

  const theme = REFLECTION_THEMES[selectedTheme]

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

      <div className="space-y-6">
        {theme.questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="block font-medium text-gray-900">
              {index + 1}. {question}
            </label>
            <Textarea
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="자유롭게 답변해주세요..."
              rows={4}
              maxLength={REFLECTION_ANSWER_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 text-right">
              {(answers[index] || '').length} / {REFLECTION_ANSWER_MAX_LENGTH}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!isSaveEnabled} size="lg">
          저장하고 계속하기
        </Button>
      </div>
    </div>
  )
}
