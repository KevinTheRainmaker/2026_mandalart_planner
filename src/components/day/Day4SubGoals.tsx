import { useState } from 'react'
import { Button, Input, RecommendationCard } from '@/components/common'
import { SUB_GOAL_MAX_LENGTH } from '@/constants'
import { generateSubGoalRecommendations } from '@/services'
import type { Mandala } from '@/types'

interface Day4SubGoalsProps {
  mandala: Mandala
  onSave: (data: { sub_goals: string[] }) => void
}

export function Day4SubGoals({ mandala, onSave }: Day4SubGoalsProps) {
  const [subGoals, setSubGoals] = useState<string[]>([
    mandala.sub_goals?.[0] || '',
    mandala.sub_goals?.[1] || '',
    mandala.sub_goals?.[2] || '',
    mandala.sub_goals?.[3] || '',
  ])

  const handleChange = (index: number, value: string) => {
    const newSubGoals = [...subGoals]
    newSubGoals[index] = value
    setSubGoals(newSubGoals)
  }

  const handleSave = () => {
    const trimmedGoals = subGoals.map((goal) => goal.trim())
    if (trimmedGoals.some((goal) => !goal)) return

    onSave({
      sub_goals: trimmedGoals,
    })
  }

  const handleRecommendationSelect = (text: string) => {
    // Find first empty slot and fill it
    const emptyIndex = subGoals.findIndex((goal) => !goal.trim())
    if (emptyIndex !== -1) {
      const newSubGoals = [...subGoals]
      newSubGoals[emptyIndex] = text
      setSubGoals(newSubGoals)
    }
  }

  const handleGenerateRecommendations = async () => {
    // Combine all existing sub-goals (from mandala and current page) to avoid duplicates
    const allExistingSubGoals = [
      ...(mandala.sub_goals || []).filter(Boolean),
      ...subGoals.filter(Boolean),
    ]
    // Remove duplicates
    const uniqueSubGoals = [...new Set(allExistingSubGoals)]
    return generateSubGoalRecommendations(
      mandala.center_goal || '',
      uniqueSubGoals
    )
  }

  const isSaveEnabled = subGoals.every((goal) => goal.trim().length > 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          하위 목표 설정 (1-4)
        </h1>
        <p className="text-gray-600">
          중심 목표를 이루기 위한 핵심 영역을 설정해주세요.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">전체 진행률:</span>
          <span className="text-lg font-bold text-blue-600">3 / 13 단계</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.round((3 / 13) * 100)}%` }}
          />
        </div>
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

      {/* Main Question */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          <span className="text-blue-600">{mandala.center_goal}</span>를 이루기
          위해 필요한 영역을 정해주세요
        </h2>
        <p className="text-gray-600">
          중심 목표를 달성하기 위한 4가지 핵심 영역을 작성해보세요.
        </p>
      </div>

      {/* AI Recommendation Card */}
      <RecommendationCard
        title="AI가 하위 목표를 추천해드려요"
        onGenerate={handleGenerateRecommendations}
        onSelect={handleRecommendationSelect}
        recommendationType="subGoal"
        centerGoal={mandala.center_goal || ''}
      />

      {/* Sub-Goals Input */}
      <div className="space-y-6">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              하위 목표 {index + 1}
            </label>
            <Input
              value={subGoals[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`하위 목표 ${index + 1}`}
              maxLength={SUB_GOAL_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 text-right">
              {subGoals[index].length} / {SUB_GOAL_MAX_LENGTH}
            </div>
          </div>
        ))}
      </div>


      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> 각 하위 목표는 중심 목표를 이루기 위한
          독립적인 영역이어야 합니다. 예를 들어 '건강한 삶 만들기'의 하위
          목표는 '운동', '식습관', '수면', '스트레스 관리' 등이 될 수 있습니다.
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

