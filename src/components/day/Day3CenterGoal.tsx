import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Input } from '@/components/common'
import { REFLECTION_THEMES, CENTER_GOAL_MAX_LENGTH } from '@/constants'
import type { Mandala } from '@/types'

interface Day3CenterGoalProps {
  mandala: Mandala
  onSave: (data: { center_goal: string }) => void
}

export function Day3CenterGoal({ mandala, onSave }: Day3CenterGoalProps) {
  const [centerGoal, setCenterGoal] = useState(mandala.center_goal || '')
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true)

  const handleSave = () => {
    const trimmedGoal = centerGoal.trim()
    if (!trimmedGoal) return

    onSave({
      center_goal: trimmedGoal,
    })
  }

  const isSaveEnabled = centerGoal.trim().length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          2026년 최종 목표
        </h1>
        <p className="text-gray-600">
          회고를 바탕으로 올해 이루고 싶은 최종 목표를 설정해보세요.
        </p>
      </div>

      {/* Day 1-2 Summary (Collapsible) */}
      <div className="bg-white rounded-lg border-2 border-gray-200">
        <button
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">Day 1-2 요약</h2>
          {isSummaryExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isSummaryExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
            {/* Reflection Theme */}
            {mandala.reflection_theme && (
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  선택한 회고 테마
                </h3>
                <p className="text-gray-900 font-medium">
                  {REFLECTION_THEMES[mandala.reflection_theme].title}
                </p>
              </div>
            )}

            {/* Reflection Notes */}
            {mandala.reflection_notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  회고 재검토 노트
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {mandala.reflection_notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Goal Input */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            중심 목표 설정
          </h2>
          <p className="text-gray-600">
            2026년, 당신이 이루고 싶은 가장 중요한 것은 무엇인가요?
          </p>
        </div>

        <div className="space-y-2">
          <Input
            value={centerGoal}
            onChange={(e) => setCenterGoal(e.target.value)}
            placeholder="예: 건강한 삶 만들기, 성공적인 커리어 구축, 행복한 가정 꾸리기"
            maxLength={CENTER_GOAL_MAX_LENGTH}
          />
          <div className="text-sm text-gray-500 text-right">
            {centerGoal.length} / {CENTER_GOAL_MAX_LENGTH}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> 구체적이면서도 의미 있는 목표를
            설정해보세요. 이 목표를 중심으로 8개의 하위 목표와 64개의
            액션플랜이 만들어집니다.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!isSaveEnabled} size="lg">
          저장하고 계속하기
        </Button>
      </div>
    </div>
  )
}
