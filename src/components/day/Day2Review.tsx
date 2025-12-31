import { useState } from 'react'
import { Button, Textarea } from '@/components/common'
import { REFLECTION_THEMES } from '@/constants'
import type { Mandala } from '@/types'

interface Day2ReviewProps {
  mandala: Mandala
  onSave: (data: { reflection_notes: string }) => void
}

const NOTES_MAX_LENGTH = 2000

export function Day2Review({ mandala, onSave }: Day2ReviewProps) {
  const [notes, setNotes] = useState(mandala.reflection_notes || '')

  const handleSave = () => {
    onSave({
      reflection_notes: notes,
    })
  }

  // If no reflection theme selected, show error
  if (!mandala.reflection_theme) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Day 1 회고를 먼저 완료해주세요
          </h2>
          <p className="text-gray-600">
            Day 2는 Day 1의 회고를 바탕으로 진행됩니다.
          </p>
        </div>
      </div>
    )
  }

  const theme = REFLECTION_THEMES[mandala.reflection_theme]
  const answers = mandala.reflection_answers

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">회고 재검토</h1>
        <p className="text-gray-600">
          어제 작성한 회고를 다시 보며 생각을 정리해보세요.
        </p>
      </div>

      {/* Previous Reflection Display */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary-700 mb-2">
            {theme.title}
          </h2>
          <p className="text-sm text-gray-500">Day 1에서 작성한 회고 내용</p>
        </div>

        <div className="space-y-6">
          {theme.questions.map((question, index) => (
            <div
              key={index}
              className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              <h3 className="font-medium text-gray-900 mb-3">
                {index + 1}. {question}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {answers[index.toString()] || '(답변 없음)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            회고 재검토 노트
          </h2>
          <p className="text-sm text-gray-600">
            회고 내용을 다시 보며 든 생각을 자유롭게 작성해주세요.
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="회고 내용을 다시 보며 어떤 생각이 드셨나요? 새롭게 떠오른 통찰이나 깨달음을 자유롭게 적어주세요."
            rows={8}
            maxLength={NOTES_MAX_LENGTH}
          />
          <div className="text-sm text-gray-500 text-right">
            {notes.length} / {NOTES_MAX_LENGTH}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} size="lg">
          저장하고 계속하기
        </Button>
      </div>
    </div>
  )
}
