import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/common'
import { REFLECTION_THEMES, THEME_KEYS, REFLECTION_ANSWER_MAX_LENGTH } from '@/constants'
import type { Mandala, ReflectionThemeKey, ReflectionAnswers } from '@/types'

interface Day1ReflectionProps {
  mandala: Mandala
  onSave: (data: {
    reflection_theme: ReflectionThemeKey
    reflection_answers: ReflectionAnswers
  }) => void
}

interface ChatMessage {
  type: 'question' | 'answer' | 'theme-select'
  content: string
  questionIndex?: number
}

export function Day1Reflection({ mandala, onSave }: Day1ReflectionProps) {
  const [selectedTheme, setSelectedTheme] = useState<ReflectionThemeKey | null>(
    mandala.reflection_theme
  )
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat
  useEffect(() => {
    if (!selectedTheme) {
      // Show initial greeting and theme selection
      setMessages([
        {
          type: 'question',
          content: '안녕하세요! 2025년 회고를 시작합니다.',
        },
        {
          type: 'theme-select',
          content: '작년 한 해는 어떤 한 해 였나요?\n아래에서 가장 가까운 테마를 선택해주세요.',
        },
      ])
    } else {
      // Restore previous session
      const theme = REFLECTION_THEMES[selectedTheme]
      const restoredMessages: ChatMessage[] = [
        {
          type: 'question',
          content: '안녕하세요! 2025년 회고를 시작합니다.',
        },
      ]

      // Add theme selection
      restoredMessages.push({
        type: 'answer',
        content: `테마: ${theme.title}`,
      })

      // Restore answered questions
      const answeredCount = Object.keys(mandala.reflection_answers).length
      for (let i = 0; i < answeredCount; i++) {
        restoredMessages.push({
          type: 'question',
          content: theme.questions[i],
          questionIndex: i,
        })
        restoredMessages.push({
          type: 'answer',
          content: mandala.reflection_answers[i] || '',
          questionIndex: i,
        })
      }

      setMessages(restoredMessages)
      setCurrentQuestionIndex(answeredCount)

      // Convert ReflectionAnswers to Record<number, string>
      const answerObj: Record<number, string> = {}
      Object.entries(mandala.reflection_answers).forEach(([key, value]) => {
        const numKey = parseInt(key, 10)
        if (!isNaN(numKey)) {
          answerObj[numKey] = value
        }
      })
      setAnswers(answerObj)

      // If all questions answered, show completion
      if (answeredCount === theme.questions.length) {
        setIsComplete(true)
      } else {
        // Show next question
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              type: 'question',
              content: theme.questions[answeredCount],
              questionIndex: answeredCount,
            },
          ])
        }, 500)
      }
    }
  }, [selectedTheme, mandala.reflection_theme, mandala.reflection_answers])

  const handleThemeSelect = (themeKey: ReflectionThemeKey) => {
    const theme = REFLECTION_THEMES[themeKey]
    setSelectedTheme(themeKey)

    // Add answer message
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== 'theme-select'),
      {
        type: 'answer',
        content: `테마: ${theme.title}`,
      },
    ])

    // Show first question after a delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'question',
          content: theme.questions[0],
          questionIndex: 0,
        },
      ])
      setCurrentQuestionIndex(0)
      inputRef.current?.focus()
    }, 800)
  }

  const handleSubmitAnswer = () => {
    if (!currentInput.trim() || !selectedTheme) return

    const theme = REFLECTION_THEMES[selectedTheme]

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      {
        type: 'answer',
        content: currentInput,
        questionIndex: currentQuestionIndex,
      },
    ])

    // Save answer
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: currentInput,
    }
    setAnswers(newAnswers)
    setCurrentInput('')

    // Move to next question or complete
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < theme.questions.length) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'question',
            content: theme.questions[nextIndex],
            questionIndex: nextIndex,
          },
        ])
        setCurrentQuestionIndex(nextIndex)
        inputRef.current?.focus()
      }, 800)
    } else {
      // All questions answered
      setIsComplete(true)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'question',
            content: '모든 질문에 답변해주셔서 감사합니다! 저장하고 다음 단계로 진행하시겠어요?',
          },
        ])
      }, 800)
    }
  }

  const handleSave = () => {
    if (!selectedTheme) return

    // Convert Record<number, string> to ReflectionAnswers
    const reflectionAnswers: ReflectionAnswers = {}
    Object.entries(answers).forEach(([key, value]) => {
      reflectionAnswers[key] = value
    })

    onSave({
      reflection_theme: selectedTheme,
      reflection_answers: reflectionAnswers,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Chat messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            {message.type === 'question' && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-primary-100 text-primary-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}

            {message.type === 'answer' && (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-gray-700 text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-sm">
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}

            {message.type === 'theme-select' && (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-primary-100 text-primary-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                    <p className="text-base whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4">
                  {THEME_KEYS.map((themeKey) => {
                    const theme = REFLECTION_THEMES[themeKey]
                    return (
                      <button
                        key={themeKey}
                        onClick={() => handleThemeSelect(themeKey)}
                        className="bg-white border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50 rounded-xl px-6 py-4 text-center transition-all transform hover:scale-105 shadow-sm"
                      >
                        <p className="font-semibold text-gray-900">{theme.title}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {selectedTheme && !isComplete && (
        <div className="border-t bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="답변을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                  rows={3}
                  maxLength={REFLECTION_ANSWER_MAX_LENGTH}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {currentInput.length} / {REFLECTION_ANSWER_MAX_LENGTH}
                </div>
              </div>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentInput.trim()}
                size="lg"
                className="mb-6"
              >
                전송
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete state - Save button */}
      {isComplete && (
        <div className="border-t bg-white px-4 py-6">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button onClick={handleSave} size="lg" className="px-12">
              저장하고 다음 단계로
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
