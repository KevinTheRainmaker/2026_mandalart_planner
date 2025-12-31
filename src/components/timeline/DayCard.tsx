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
        <span className="text-sm font-semibold text-gray-700">Day {day}</span>
        {status === 'completed' && (
          <svg
            className="w-5 h-5 text-primary-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === 'current' && (
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
        )}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{title}</p>
    </div>
  )
}
