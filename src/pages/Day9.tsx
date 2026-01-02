import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { DayActionPlan, DayWaitScreen } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

const DEBUG_EMAIL = 'kangbeen.ko@gm.gist.ac.kr'

export function Day9() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)
  const [showWaitScreen, setShowWaitScreen] = useState(false)

  const isDebugAccount = user?.email === DEBUG_EMAIL

  const handleSave = async (data: { action_plans: Record<string, string[]> }) => {
    if (!mandala) return

    await updateMandala({
      action_plans: {
        ...mandala.action_plans,
        ...data.action_plans,
      },
      completed_days: [...(mandala.completed_days || []), 9],
      current_day: 10,
    })

    // Debug account can proceed immediately
    if (isDebugAccount) {
      navigate('/day/10')
    } else {
      // Show wait screen until midnight
      setShowWaitScreen(true)
    }
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

  // Show wait screen after saving (non-debug accounts only)
  if (showWaitScreen) {
    return <DayWaitScreen currentDay={9} nextDay={10} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <DayActionPlan mandala={mandala} dayNumber={9} onSave={handleSave} />
      </Container>
    </div>
  )
}
