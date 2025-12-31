import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { DayActionPlan } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

export function Day8() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)

  const handleSave = async (data: { action_plans: Record<string, string[]> }) => {
    if (!mandala) return

    await updateMandala({
      action_plans: {
        ...mandala.action_plans,
        ...data.action_plans,
      },
      completed_days: [...(mandala.completed_days || []), 8],
      current_day: 9,
    })

    navigate('/day/9')
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
        <DayActionPlan mandala={mandala} dayNumber={8} onSave={handleSave} />
      </Container>
    </div>
  )
}
