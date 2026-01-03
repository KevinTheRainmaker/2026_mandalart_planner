import { useNavigate } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import { Day1Reflection } from '@/components/day'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'
import type { ReflectionThemeKey, ReflectionAnswers } from '@/types'

export function Day1() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)

  const handleSave = async (data: {
    reflection_theme: ReflectionThemeKey
    reflection_answers: ReflectionAnswers
  }) => {
    if (!mandala) return

    // Update mandala with reflection data and mark steps 1 and 2 as completed (step 2 is removed)
    await updateMandala({
      reflection_theme: data.reflection_theme,
      reflection_answers: data.reflection_answers,
      completed_days: [...(mandala.completed_days || []), 1, 2],
      current_day: 3,
    })

    // Skip step 2, proceed directly to step 3
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
        <Day1Reflection mandala={mandala} onSave={handleSave} />
      </Container>
    </div>
  )
}
