import { useState } from 'react'
import { Button, Input } from '@/components/common'
import { SUB_GOAL_MAX_LENGTH } from '@/constants'
import type { Mandala } from '@/types'

interface Day5SubGoalsProps {
  mandala: Mandala
  onSave: (data: { sub_goals: string[] }) => void
}

export function Day5SubGoals({ mandala, onSave }: Day5SubGoalsProps) {
  const [subGoals, setSubGoals] = useState<string[]>([
    mandala.sub_goals?.[4] || '',
    mandala.sub_goals?.[5] || '',
    mandala.sub_goals?.[6] || '',
    mandala.sub_goals?.[7] || '',
  ])

  const handleChange = (index: number, value: string) => {
    const newSubGoals = [...subGoals]
    newSubGoals[index] = value
    setSubGoals(newSubGoals)
  }

  const handleSave = () => {
    const trimmedGoals = subGoals.map((goal) => goal.trim())
    if (trimmedGoals.some((goal) => !goal)) return

    // Combine first 4 sub-goals from mandala with new 4 sub-goals
    const allSubGoals = [
      ...(mandala.sub_goals?.slice(0, 4) || []),
      ...trimmedGoals,
    ]

    onSave({
      sub_goals: allSubGoals,
    })
  }

  const isSaveEnabled = subGoals.every((goal) => goal.trim().length > 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          하위 목표 설정 (5-8)
        </h1>
        <p className="text-gray-600">
          중심 목표를 이루기 위한 나머지 핵심 영역을 설정해주세요.
        </p>
      </div>

      {/* Center Goal Display */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-sm font-medium text-blue-600 mb-2">
            2026년 중심 목표
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {mandala.center_goal}
          </div>
        </div>
      </div>

      {/* Previous Sub-Goals Summary */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          이미 설정한 하위 목표 (1-4)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {mandala.sub_goals?.slice(0, 4).map((goal, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="text-xs text-gray-500 mb-1">
                하위 목표 {index + 1}
              </div>
              <div className="text-sm font-medium text-gray-900">{goal}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Question */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          <span className="text-blue-600">{mandala.center_goal}</span>를 이루기
          위해 필요한 영역을 정해주세요
        </h2>
        <p className="text-gray-600">
          중심 목표를 달성하기 위한 나머지 4가지 핵심 영역을 작성해보세요.
        </p>
      </div>

      {/* Sub-Goals Input */}
      <div className="space-y-6">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              하위 목표 {index + 5}
            </label>
            <Input
              value={subGoals[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`하위 목표 ${index + 5}`}
              maxLength={SUB_GOAL_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 text-right">
              {subGoals[index].length} / {SUB_GOAL_MAX_LENGTH}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">진행률:</span>
          <span className="text-lg font-bold text-green-600">8 / 8</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: '100%' }}
          />
        </div>
        <p className="text-xs text-green-700 mt-2">
          모든 하위 목표를 완성하면 액션플랜 단계로 넘어갑니다!
        </p>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> 8개의 하위 목표는 서로 보완적이어야
          합니다. 전체적으로 균형 잡힌 삶을 위한 영역들을 선택했는지
          확인해보세요.
        </p>
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
