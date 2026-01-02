import { useState, useEffect } from 'react'
import type { Mandala, MandalaUpdate } from '@/types'
import { updateMandala as updateMandalaApi } from '@/lib/api'
import { useMandalaStore } from '@/store'

interface MandalaGridProps {
  mandala: Mandala
  onUpdate?: (updates: MandalaUpdate) => Promise<void>
}

export function MandalaGrid({ mandala, onUpdate }: MandalaGridProps) {
  const { center_goal, sub_goals, action_plans, ai_summary, name, commitment } = mandala
  const { setMandala } = useMandalaStore()

  const [editableName, setEditableName] = useState(name || '')
  const [editableCommitment, setEditableCommitment] = useState(commitment || '')
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state with prop changes
  useEffect(() => {
    setEditableName(name || '')
  }, [name])

  useEffect(() => {
    setEditableCommitment(commitment || '')
  }, [commitment])

  const handleNameChange = (value: string) => {
    setEditableName(value)
  }

  const handleCommitmentChange = (value: string) => {
    setEditableCommitment(value)
  }

  const handleNameBlur = async () => {
    if (editableName !== name && mandala.id) {
      setIsSaving(true)
      try {
        // Update directly via API to avoid triggering global loading state
        const updated = await updateMandalaApi(mandala.id, { name: editableName })
        // Update Zustand store to reflect changes in PDF
        if (updated) {
          setMandala(updated)
          console.log('Name updated in store:', updated.name)
        }
      } catch (error) {
        console.error('Failed to update name:', error)
        // Revert on error
        setEditableName(name || '')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleCommitmentBlur = async () => {
    if (editableCommitment !== commitment && mandala.id) {
      setIsSaving(true)
      try {
        // Update directly via API to avoid triggering global loading state
        const updated = await updateMandalaApi(mandala.id, { commitment: editableCommitment })
        // Update Zustand store to reflect changes in PDF
        if (updated) {
          setMandala(updated)
          console.log('Commitment updated in store:', updated.commitment)
        }
      } catch (error) {
        console.error('Failed to update commitment:', error)
        // Revert on error
        setEditableCommitment(commitment || '')
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Get keywords from AI summary
  const keywords = ai_summary?.keywords || []

  const getActionPlans = (index: number): string[] => {
    const plans = action_plans[index.toString()] || []
    return Array.from({ length: 8 }, (_, i) => plans[i] || '')
  }

  const getSubGoal = (index: number): string => sub_goals[index] || ''

  const sectionColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-yellow-50 border-yellow-200',
    'bg-pink-50 border-pink-200',
    'bg-purple-50 border-purple-200',
    'bg-indigo-50 border-indigo-200',
    'bg-red-50 border-red-200',
    'bg-orange-50 border-orange-200',
    'bg-teal-50 border-teal-200',
  ]

  const renderSection = (sectionIndex: number) => {
    const isCenter = sectionIndex === 4
    const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
    const colorClass = sectionColors[sectionIndex]

    if (isCenter) {
      return (
        <div
          key={sectionIndex}
          data-testid="mandala-section"
          className={`grid grid-cols-3 grid-rows-3 gap-0.5 ${colorClass} border-2 p-1`}
        >
          {Array.from({ length: 9 }).map((_, cellIndex) => {
            const isCenterCell = cellIndex === 4
            return (
              <div
                key={cellIndex}
                data-testid={isCenterCell ? 'center-cell' : 'mandala-cell'}
                className={`border border-gray-300 p-1 flex items-center justify-center text-center min-h-[3rem] break-words ${
                  isCenterCell ? 'bg-primary-500 text-white font-bold text-sm' : 'bg-white text-xs'
                }`}
              >
                {isCenterCell && center_goal}
              </div>
            )
          })}
        </div>
      )
    }

    const subGoal = getSubGoal(subGoalIndex)
    const plans = getActionPlans(subGoalIndex)

    return (
      <div
        key={sectionIndex}
        data-testid="mandala-section"
        className={`grid grid-cols-3 grid-rows-3 gap-0.5 ${colorClass} border-2 p-1`}
      >
        {Array.from({ length: 9 }).map((_, cellIndex) => {
          const isCenterCell = cellIndex === 4
          const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
          const plan = plans[planIndex] || ''
          return (
            <div
              key={cellIndex}
              data-testid="mandala-cell"
              className={`border border-gray-300 p-1 flex items-center justify-center text-center min-h-[3rem] break-words ${
                isCenterCell ? 'bg-gray-700 text-white font-semibold text-xs' : 'bg-white text-xs'
              }`}
            >
              {isCenterCell ? subGoal : plan}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Name Input */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이름 {isSaving && <span className="text-xs text-gray-500">(저장 중...)</span>}
        </label>
        <input
          type="text"
          value={editableName}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleNameBlur}
          disabled={isSaving}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            핵심 키워드
          </label>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 9x9 Mandala Grid */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div
          data-testid="mandala-grid"
          className="grid grid-cols-3 grid-rows-3 gap-2 bg-gray-100 p-4 rounded-lg"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderSection)}
        </div>
      </div>

      {/* Commitment Input */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          다짐 {isSaving && <span className="text-xs text-gray-500">(저장 중...)</span>}
        </label>
        <textarea
          value={editableCommitment}
          onChange={(e) => handleCommitmentChange(e.target.value)}
          onBlur={handleCommitmentBlur}
          disabled={isSaving}
          placeholder="올해의 다짐을 입력하세요"
          rows={3}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}
