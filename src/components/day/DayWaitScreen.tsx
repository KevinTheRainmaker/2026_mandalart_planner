import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Button } from '@/components/common'

interface DayWaitScreenProps {
  currentDay: number
  nextDay: number
}

export function DayWaitScreen({ currentDay, nextDay }: DayWaitScreenProps) {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

      // Calculate midnight Korea time
      const midnight = new Date(koreaTime)
      midnight.setHours(24, 0, 0, 0)

      const diff = midnight.getTime() - koreaTime.getTime()

      if (diff <= 0) {
        // Midnight has passed, allow navigation
        navigate(`/day/${nextDay}`)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [nextDay, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="text-6xl">⏰</div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentDay}일차 완료!
            </h1>
            <p className="text-xl text-gray-600">
              다음 단계는 내일 자정에 시작됩니다
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              다음 단계까지 남은 시간
            </div>
            <div className="text-5xl font-bold text-primary-600 font-mono">
              {timeLeft}
            </div>
            <div className="text-sm text-gray-500">
              한국 시간 기준 자정
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              14일간의 여정을 통해 차근차근 목표를 만들어가고 있습니다.
            </p>
            <p className="text-gray-600">
              내일 다시 만나요! 😊
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </Container>
    </div>
  )
}
