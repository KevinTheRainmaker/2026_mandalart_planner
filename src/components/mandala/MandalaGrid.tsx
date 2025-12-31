import type { Mandala } from '@/types'

interface MandalaGridProps {
  mandala: Mandala
}

export function MandalaGrid({ mandala }: MandalaGridProps) {
  const { center_goal, sub_goals, action_plans } = mandala

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
    <div className="w-full max-w-4xl mx-auto">
      <div
        data-testid="mandala-grid"
        className="grid grid-cols-3 grid-rows-3 gap-2 bg-gray-100 p-4 rounded-lg"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderSection)}
      </div>
    </div>
  )
}
