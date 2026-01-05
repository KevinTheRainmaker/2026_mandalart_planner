import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Button, Loading } from '@/components/common'
import { useAuth, useMandala } from '@/hooks'

export function MandaratEdit() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)
  const [isSaving, setIsSaving] = useState(false)

  // Local state for editing
  const [centerGoal, setCenterGoal] = useState(mandala?.center_goal || '')
  const [subGoals, setSubGoals] = useState<string[]>(
    mandala?.sub_goals || Array(8).fill('')
  )
  const [actionPlans, setActionPlans] = useState<{ [key: string]: string[] }>(
    mandala?.action_plans || {}
  )

  const handleSubGoalChange = (index: number, value: string) => {
    const newSubGoals = [...subGoals]
    newSubGoals[index] = value
    setSubGoals(newSubGoals)
  }

  const handleActionPlanChange = (
    subGoalIndex: number,
    planIndex: number,
    value: string
  ) => {
    const newActionPlans = { ...actionPlans }
    if (!newActionPlans[subGoalIndex.toString()]) {
      newActionPlans[subGoalIndex.toString()] = Array(8).fill('')
    }
    newActionPlans[subGoalIndex.toString()][planIndex] = value
    setActionPlans(newActionPlans)
  }

  const handleSave = async () => {
    if (!mandala) return

    setIsSaving(true)
    try {
      await updateMandala({
        center_goal: centerGoal,
        sub_goals: subGoals,
        action_plans: actionPlans,
      })
      alert('만다라트가 성공적으로 저장되었습니다!')
      navigate('/step/14')
    } catch (error) {
      console.error('Failed to save mandala:', error)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/step/14')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="로딩 중..." />
      </div>
    )
  }

  if (!mandala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600">만다라트를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <div className="space-y-8">
          {/* Title */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                만다라트 수정하기
              </h1>
              <p className="text-gray-600">
                중심 목표와 세부 목표, 실행 계획을 수정할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCancel} variant="secondary">
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>

          {/* Center Goal */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              중심 목표
            </h3>
            <input
              type="text"
              value={centerGoal}
              onChange={(e) => setCenterGoal(e.target.value)}
              placeholder="중심 목표를 입력하세요"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
            />
          </div>

          {/* Sub Goals and Action Plans */}
          <div className="space-y-6">
            {subGoals.map((subGoal, subGoalIndex) => (
              <div
                key={subGoalIndex}
                className="bg-white rounded-lg border-2 border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  세부 목표 {subGoalIndex + 1}
                </h3>
                <input
                  type="text"
                  value={subGoal}
                  onChange={(e) => handleSubGoalChange(subGoalIndex, e.target.value)}
                  placeholder={`세부 목표 ${subGoalIndex + 1}을 입력하세요`}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none mb-4"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, planIndex) => {
                    const plans = actionPlans[subGoalIndex.toString()] || Array(8).fill('')
                    return (
                      <input
                        key={planIndex}
                        type="text"
                        value={plans[planIndex] || ''}
                        onChange={(e) =>
                          handleActionPlanChange(subGoalIndex, planIndex, e.target.value)
                        }
                        placeholder={`실행 계획 ${planIndex + 1}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <Button onClick={handleCancel} variant="secondary" size="lg">
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
