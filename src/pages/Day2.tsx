import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Day3CenterGoal } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

export function Day2() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)

  const handleSave = async (data: { center_goal: string }) => {
    if (!mandala) return

    // Update mandala with center goal and mark step as completed
    await updateMandala({
      center_goal: data.center_goal,
      completed_days: [...(mandala.completed_days || []), 2],
      current_day: 3,
    })

    // Proceed to next step immediately
    navigate('/step/3')
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
        <Day3CenterGoal mandala={mandala} onSave={handleSave} />
      </Container>
    </div>
  )
}
