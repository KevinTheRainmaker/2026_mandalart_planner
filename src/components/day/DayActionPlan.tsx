import { useState } from 'react'
import { Button, Input, RecommendationCard } from '@/components/common'
import { ACTION_PLAN_MAX_LENGTH } from '@/constants'
import { generateActionPlanRecommendations, OtherSubGoalPlans } from '@/services'
import type { Mandala } from '@/types'

interface DayActionPlanProps {
  mandala: Mandala
  dayNumber: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  onSave: (data: { action_plans: Record<string, string[]> }) => void
}

export function DayActionPlan({
  mandala,
  dayNumber,
  onSave,
}: DayActionPlanProps) {
  // Calculate sub-goal index from day number (Day 5 = index 0, Day 12 = index 7)
  const subGoalIndex = dayNumber - 5
  const subGoal = mandala.sub_goals?.[subGoalIndex] || ''
  const progressNumber = subGoalIndex + 1

  // Initialize action plans from existing data or empty array
  const existingPlans = mandala.action_plans?.[subGoalIndex.toString()] || []
  const [actionPlans, setActionPlans] = useState<string[]>(
    Array.from({ length: 8 }, (_, i) => existingPlans[i] || '')
  )

  const handleChange = (index: number, value: string) => {
    const newActionPlans = [...actionPlans]
    newActionPlans[index] = value
    setActionPlans(newActionPlans)
  }

  const handleSave = () => {
    const trimmedPlans = actionPlans.map((plan) => plan.trim())
    if (trimmedPlans.some((plan) => !plan)) return

    onSave({
      action_plans: {
        [subGoalIndex.toString()]: trimmedPlans,
      },
    })
  }

  const handleRecommendationSelect = (text: string) => {
    // Find first empty slot and fill it
    const emptyIndex = actionPlans.findIndex((plan) => !plan.trim())
    if (emptyIndex !== -1) {
      const newActionPlans = [...actionPlans]
      newActionPlans[emptyIndex] = text
      setActionPlans(newActionPlans)
    }
  }

  const handleGenerateRecommendations = async () => {
    // Collect action plans from other sub-goals to avoid duplication
    const otherSubGoalsPlans: OtherSubGoalPlans[] = []
    
    if (mandala.action_plans && mandala.sub_goals) {
      for (let i = 0; i < 8; i++) {
        // Skip current sub-goal
        if (i === subGoalIndex) continue
        
        const plans = mandala.action_plans[i.toString()]
        const otherSubGoal = mandala.sub_goals[i]
        
        if (plans && plans.length > 0 && otherSubGoal) {
          otherSubGoalsPlans.push({
            subGoal: otherSubGoal,
            plans: plans.filter(Boolean),
          })
        }
      }
    }
    
    return generateActionPlanRecommendations(
      mandala.center_goal || '',
      subGoal,
      actionPlans.filter(Boolean),
      otherSubGoalsPlans
    )
  }

  const isSaveEnabled = actionPlans.every((plan) => plan.trim().length > 0)


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          액션플랜 작성 {progressNumber}
        </h1>
        <p className="text-gray-600">
          하위 목표를 달성하기 위한 구체적인 행동을 계획해보세요.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">전체 진행률:</span>
          <span className="text-lg font-bold text-blue-600">
            {dayNumber} / 13 단계
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.round((dayNumber / 13) * 100)}%` }}
          />
        </div>
      </div>

      {/* Sub-Goal Display */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-sm font-medium text-blue-600 mb-2">
            하위 목표 {progressNumber}
          </div>
          <div className="text-2xl font-bold text-gray-900">{subGoal}</div>
        </div>
      </div>

      {/* Main Question */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          <span className="text-blue-600">{subGoal}</span>을 달성하기 위한
          구체적인 행동 8가지를 작성해주세요
        </h2>
        <p className="text-gray-600">
          실제로 실행 가능한 구체적인 액션플랜을 작성하세요.
        </p>
      </div>

      {/* AI Recommendation Card */}
      <RecommendationCard
        title="AI가 액션플랜을 추천해드려요"
        onGenerate={handleGenerateRecommendations}
        onSelect={handleRecommendationSelect}
      />

      {/* Action Plans Input */}
      <div className="space-y-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {index + 1}. 액션플랜
            </label>
            <Input
              value={actionPlans[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`액션플랜 ${index + 1}`}
              maxLength={ACTION_PLAN_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 text-right">
              {actionPlans[index].length} / {ACTION_PLAN_MAX_LENGTH}
            </div>
          </div>
        ))}
      </div>


      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> 액션플랜은 구체적이고 측정 가능하며 실행
          가능해야 합니다. 예를 들어 "운동하기"보다는 "매일 아침 7시에 30분
          조깅하기"처럼 구체적으로 작성하세요.
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

