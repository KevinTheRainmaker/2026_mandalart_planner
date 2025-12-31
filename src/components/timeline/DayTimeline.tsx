import { useNavigate } from 'react-router-dom'
import { DayCard } from './DayCard'
import { DAY_PROMPTS } from '@/constants'
import type { Mandala } from '@/types'

interface DayTimelineProps {
  mandala: Mandala | null
}

export function DayTimeline({ mandala }: DayTimelineProps) {
  const navigate = useNavigate()

  const getDayStatus = (day: number) => {
    if (!mandala) {
      return day === 1 ? 'current' : 'locked'
    }

    const currentDay = mandala.current_day
    const completedDays = mandala.completed_days || []

    if (completedDays.includes(day)) {
      return 'completed'
    }

    if (day === currentDay) {
      return 'current'
    }

    if (day < currentDay) {
      return 'available'
    }

    return 'locked'
  }

  const handleDayClick = (day: number) => {
    navigate(`/day/${day}`)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">14일 여정</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => (
          <DayCard
            key={day}
            day={day}
            title={DAY_PROMPTS[day as keyof typeof DAY_PROMPTS].title}
            status={getDayStatus(day)}
            onClick={handleDayClick}
          />
        ))}
      </div>
    </div>
  )
}
