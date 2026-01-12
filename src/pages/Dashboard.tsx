import { useEffect, useState } from 'react'
import { HandWaving, Target } from '@phosphor-icons/react'
import { useAuth, useMandala } from '@/hooks'
import { Header, Container } from '@/components/layout'
import { DayTimeline } from '@/components/timeline'
import { Loading, Button } from '@/components/common'
import { createMandala } from '@/lib/api'

export function Dashboard() {
  const { user } = useAuth()
  const { mandala, isLoading, loadMandala } = useMandala(user?.id, 2026)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadMandala()
    }
  }, [user?.id, loadMandala])

  const handleCreateMandala = async () => {
    if (!user?.id) return

    setIsCreating(true)
    try {
      await createMandala({
        user_id: user.id,
        year: 2026,
        marketing_consent: false,
      })
      await loadMandala()
    } catch (error) {
      console.error('Failed to create mandala:', error)
      alert('목표 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loading size="lg" message="데이터를 불러오는 중..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Container className="py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            안녕하세요! <HandWaving size={32} weight="duotone" className="text-amber-500" />
          </h1>
          <p className="text-gray-600">
            13단계 여정을 통해 2026년 목표를 설계해보세요
          </p>
        </div>

        {/* No Mandala - Create New */}
        {!mandala && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <Target size={64} weight="duotone" className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                새로운 여정을 시작하세요
              </h2>
              <p className="text-gray-600">
                2026년 만다라트 목표 설계를 시작합니다
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCreateMandala}
              disabled={isCreating}
            >
              {isCreating ? <Loading size="sm" /> : '시작하기'}
            </Button>
          </div>
        )}

        {/* Existing Mandala - Show Timeline */}
        {mandala && (
          <div className="space-y-8">
            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                진행 상황
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {mandala.current_day}
                  </div>
                  <div className="text-sm text-gray-600">현재 단계</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {mandala.completed_days?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">완료한 단계</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {Math.round(
                      ((mandala.completed_days?.length || 0) / 13) * 100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">전체 진행률</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <DayTimeline mandala={mandala} />
            </div>

            {/* Quick Summary (if has data) */}
            {mandala.center_goal && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  내 목표
                </h2>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-lg font-medium text-primary-900">
                    {mandala.center_goal}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
