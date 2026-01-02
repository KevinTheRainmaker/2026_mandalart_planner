import { useState } from 'react'
import type { Mandala, MandalaUpdate } from '@/types'

interface MandalaGridProps {
  mandala: Mandala
  onUpdate?: (updates: MandalaUpdate) => Promise<void>
}

export function MandalaGrid({ mandala, onUpdate }: MandalaGridProps) {
  const { center_goal, sub_goals, ai_summary, name, commitment } = mandala

  const [editableName, setEditableName] = useState(name || '')
  const [editableCommitment, setEditableCommitment] = useState(commitment || '')

  const handleNameChange = (value: string) => {
    setEditableName(value)
  }

  const handleCommitmentChange = (value: string) => {
    setEditableCommitment(value)
  }

  const handleNameBlur = async () => {
    if (editableName !== name && onUpdate) {
      await onUpdate({ name: editableName })
    }
  }

  const handleCommitmentBlur = async () => {
    if (editableCommitment !== commitment && onUpdate) {
      await onUpdate({ commitment: editableCommitment })
    }
  }

  // Get keywords from AI summary
  const keywords = ai_summary?.keywords || []

  // Arrange sub-goals in 3x3 grid pattern (center is center_goal, rest are sub_goals)
  // Grid positions: 0,1,2,3,4,5,6,7,8
  // Position 4 (center) = center goal
  // Positions 0,1,2,3,5,6,7,8 = sub goals (8 total)
  const getGridCell = (position: number): string => {
    if (position === 4) {
      return center_goal || '중심 목표'
    }
    // Map grid position to sub_goal index
    const subGoalIndex = position < 4 ? position : position - 1
    return sub_goals[subGoalIndex] || `하위 목표 ${subGoalIndex + 1}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-amber-50 p-8 rounded-lg">
      {/* Name Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이름
        </label>
        <input
          type="text"
          value={editableName}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleNameBlur}
          placeholder="이름을 입력하세요"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            핵심 키워드
          </label>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3x3 Mandala Grid */}
      <div className="mb-6">
        <div
          data-testid="mandala-grid"
          className="grid grid-cols-3 grid-rows-3 gap-2 bg-white p-4 rounded-lg border-2 border-gray-300"
        >
          {Array.from({ length: 9 }).map((_, position) => {
            const isCenter = position === 4
            const cellContent = getGridCell(position)

            return (
              <div
                key={position}
                data-testid={isCenter ? 'center-cell' : 'mandala-cell'}
                className={`
                  border-2 rounded-lg p-4 flex items-center justify-center text-center min-h-[100px]
                  ${
                    isCenter
                      ? 'bg-amber-500 text-white font-bold text-base border-amber-600'
                      : 'bg-white text-gray-800 font-medium text-sm border-gray-300'
                  }
                `}
              >
                <div className="break-words w-full">{cellContent}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Commitment Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          다짐
        </label>
        <textarea
          value={editableCommitment}
          onChange={(e) => handleCommitmentChange(e.target.value)}
          onBlur={handleCommitmentBlur}
          placeholder="올해의 다짐을 입력하세요"
          rows={3}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}
