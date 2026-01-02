import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Day2Review, DayWaitScreen } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

const DEBUG_EMAIL = 'kangbeen.ko@gm.gist.ac.kr'

export function Day2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)
  const [showWaitScreen, setShowWaitScreen] = useState(false)

  const isDebugAccount = user?.email === DEBUG_EMAIL

  const handleSave = async (data: { reflection_notes: string }) => {
    if (!mandala) return

    // Update mandala with reflection notes and mark day as completed
    await updateMandala({
      reflection_notes: data.reflection_notes,
      completed_days: [...(mandala.completed_days || []), 2],
      current_day: 3,
    })

    // Debug account can proceed immediately
    if (isDebugAccount) {
      navigate('/day/3')
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
    return <DayWaitScreen currentDay={2} nextDay={3} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <Day2Review mandala={mandala} onSave={handleSave} />
      </Container>
    </div>
  )
}
