import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Day4SubGoals } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

export function Day4() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)

  const handleSave = async (data: { sub_goals: string[] }) => {
    if (!mandala) return

    // Update mandala with first 4 sub-goals and mark day as completed
    await updateMandala({
      sub_goals: data.sub_goals,
      completed_days: [...(mandala.completed_days || []), 4],
      current_day: 5,
    })

    // Navigate to day 5
    navigate('/day/5')
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
        <Day4SubGoals mandala={mandala} onSave={handleSave} />
      </Container>
    </div>
  )
}
