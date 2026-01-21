import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/common'
import { CENTER_GOAL_MAX_LENGTH } from '@/constants'
import { generateGoalSuggestion } from '@/services/chatService'
import type { Mandala } from '@/types'

interface Day3CenterGoalProps {
  mandala: Mandala
  onSave: (data: { center_goal: string }) => void
}

interface ChatMessage {
  type: 'question' | 'answer' | 'loading' | 'suggestion'
  content: string
}

export function Day3CenterGoal({ mandala, onSave }: Day3CenterGoalProps) {
  const [centerGoal, setCenterGoal] = useState(mandala.center_goal || '')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [goalSuggestion, setGoalSuggestion] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat with LLM goal suggestion
  useEffect(() => {
    const initChat = async () => {
      // Initial greeting
      setMessages([
        {
          type: 'question',
          content: "안녕하세요! 이제 2026년 핵심 목표를 설정할 차례입니다. 핵심 목표는 한 해 동안 가장 중요한 '결과(outcome)'를 담아, 구체적으로 달성 여부를 판단할 수 있도록 한 문장으로 설정하는 것이 가장 좋습니다.",
        },
      ])

      // Generate goal suggestion based on reflection
      if (mandala.reflection_theme && Object.keys(mandala.reflection_answers).length > 0) {
        setIsLoading(true)
        setMessages((prev) => [...prev, { type: 'loading', content: '' }])

        try {
          const suggestion = await generateGoalSuggestion(
            mandala.reflection_theme,
            mandala.reflection_answers
          )

          setGoalSuggestion(suggestion.suggestion)

          setMessages((prev) => {
            const withoutLoading = prev.filter((m) => m.type !== 'loading')
            return [
              ...withoutLoading,
              {
                type: 'question',
                content: `당신의 회고 내용을 분석해봤어요.\n\n${suggestion.reasoning}`,
              },
              {
                type: 'suggestion',
                content: suggestion.suggestion
                  ? `💡 제안 목표: "${suggestion.suggestion}"\n\n이 목표를 사용하시거나, 직접 입력해주세요!`
                  : '아래에 올해의 핵심 목표를 입력해주세요!',
              },
            ]
          })
        } catch (error) {
          console.error('Failed to generate goal suggestion:', error)
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== 'loading'),
            {
              type: 'question',
              content: '회고 내용을 바탕으로 올해의 핵심 목표를 설정해보세요!',
            },
          ])
        } finally {
          setIsLoading(false)
          inputRef.current?.focus()
        }
      } else {
        // No reflection data, just ask for goal
        setMessages((prev) => [
          ...prev,
          {
            type: 'question',
            content: '2026년, 당신이 이루고 싶은 가장 중요한 것은 무엇인가요?',
          },
        ])
        inputRef.current?.focus()
      }
    }

    initChat()
  }, [])

  const handleSubmit = () => {
    if (!centerGoal.trim()) return

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      {
        type: 'answer',
        content: centerGoal,
      },
      {
        type: 'question',
        content: `"${centerGoal}" 좋은 목표네요! ✨\n\n이 목표를 중심으로 8개의 하위 목표와 64개의 액션플랜이 만들어집니다.\n\n저장하고 다음 단계로 진행하시겠어요?`,
      },
    ])

    setIsComplete(true)
  }

  const handleUseSuggestion = () => {
    if (goalSuggestion) {
      setCenterGoal(goalSuggestion)
      inputRef.current?.focus()
    }
  }

  const handleSave = () => {
    const trimmedGoal = centerGoal.trim()
    if (!trimmedGoal) return

    onSave({
      center_goal: trimmedGoal,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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

            {message.type === 'suggestion' && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                  {goalSuggestion && (
                    <button
                      onClick={handleUseSuggestion}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      이 목표 사용하기
                    </button>
                  )}
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

            {message.type === 'loading' && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-primary-100 text-primary-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">회고 내용 분석 중</span>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {!isComplete && (
        <div className="border-t bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={centerGoal}
                  onChange={(e) => setCenterGoal(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="예: 건강한 삶 만들기, 성공적인 커리어 구축..."
                  maxLength={CENTER_GOAL_MAX_LENGTH}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none disabled:bg-gray-100"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {centerGoal.length} / {CENTER_GOAL_MAX_LENGTH}
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!centerGoal.trim() || isLoading}
                size="lg"
              >
                확인
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
