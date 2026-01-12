import { CheckCircle } from '@phosphor-icons/react'

type DayStatus = 'completed' | 'current' | 'available' | 'locked'

interface DayCardProps {
  day: number
  title: string
  status: DayStatus
  onClick: (day: number) => void
}

export function DayCard({ day, title, status, onClick }: DayCardProps) {
  const handleClick = () => {
    if (status !== 'locked') {
      onClick(day)
    }
  }

  const statusStyles = {
    completed: 'border-primary-600 bg-white',
    current: 'border-primary-600 bg-primary-50',
    available: 'border-gray-300 bg-white hover:border-primary-400',
    locked: 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed',
  }

  const cursorStyle = status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${statusStyles[status]} ${cursorStyle}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">단계 {day}</span>
        {status === 'completed' && (
          <CheckCircle size={20} weight="fill" className="text-primary-600" />
        )}
        {status === 'current' && (
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
        )}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{title}</p>
    </div>
  )
}
