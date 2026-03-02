import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HandWaving, Target, ChatTeardropDots, FastForward, ArrowCounterClockwise } from '@phosphor-icons/react'
import { useAuth, useMandala } from '@/hooks'
import { Header, Container } from '@/components/layout'
import { DayTimeline } from '@/components/timeline'
import { Loading, Button } from '@/components/common'
import { createMandala } from '@/lib/api'

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, loadMandala, updateMandala } = useMandala(user?.id, 2026)
  const [isCreating, setIsCreating] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [showRedoConfirm, setShowRedoConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadMandala()
    }
  }, [user?.id, loadMandala])

  const hasCompletedReflection = mandala?.completed_days?.includes(1) ?? false

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

  const handleSkipReflection = async () => {
    if (!mandala) return

    setIsSkipping(true)
    try {
      await updateMandala({
        completed_days: [...(mandala.completed_days || []), 1],
        current_day: Math.max(mandala.current_day, 2),
      })
    } catch (error) {
      console.error('Failed to skip reflection:', error)
      alert('건너뛰기에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSkipping(false)
    }
  }

  const handleRedoReflection = async () => {
    if (!mandala) return

    setIsResetting(true)
    try {
      const updatedCompletedDays = (mandala.completed_days || []).filter(d => d !== 1)
      await updateMandala({
        reflection_theme: null,
        reflection_answers: {},
        completed_days: updatedCompletedDays,
        current_day: 1,
      })
      navigate('/step/1')
    } catch (error) {
      console.error('Failed to reset reflection:', error)
      alert('회고 초기화에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsResetting(false)
      setShowRedoConfirm(false)
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

        {/* Mandala exists but reflection not done - Show Choice */}
        {mandala && !hasCompletedReflection && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                2025년 회고를 진행할까요?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                회고를 통해 올해 목표를 더 의미있게 설정할 수 있어요.
                <br />
                나중에 대시보드에서 언제든지 다시 시작할 수 있습니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Do Reflection */}
                <button
                  onClick={() => navigate('/step/1')}
                  className="group border-2 border-primary-200 hover:border-primary-500 bg-primary-50 hover:bg-primary-100 rounded-xl p-6 text-center transition-all transform hover:scale-105 shadow-sm"
                >
                  <div className="flex justify-center mb-4">
                    <ChatTeardropDots size={48} weight="duotone" className="text-primary-500 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    회고하기
                  </h3>
                  <p className="text-sm text-gray-600">
                    AI와 대화하며 2025년을 돌아보고,
                    <br />
                    맞춤 목표 추천을 받아보세요
                  </p>
                </button>

                {/* Skip Reflection */}
                <button
                  onClick={handleSkipReflection}
                  disabled={isSkipping}
                  className="group border-2 border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-all transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-center mb-4">
                    <FastForward size={48} weight="duotone" className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {isSkipping ? '처리 중...' : '건너뛰기'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    바로 목표 설정을 시작합니다.
                    <br />
                    나중에 언제든 회고할 수 있어요
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Mandala with reflection done - Show Timeline */}
        {mandala && hasCompletedReflection && (
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
                    {Math.min(13, mandala.completed_days?.length || 0)}
                  </div>
                  <div className="text-sm text-gray-600">완료한 단계</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {Math.min(100, Math.round(
                      ((mandala.completed_days?.length || 0) / 13) * 100)
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">전체 진행률</div>
                </div>
              </div>
            </div>

            {/* Reflection Redo Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    2025년 회고
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {mandala.reflection_theme
                      ? '회고를 완료했습니다.'
                      : '회고를 건너뛰었습니다. 원하시면 지금 시작할 수 있어요.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (mandala.reflection_theme) {
                      setShowRedoConfirm(true)
                    } else {
                      navigate('/step/1')
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <ArrowCounterClockwise size={18} weight="bold" />
                  {mandala.reflection_theme ? '회고 다시하기' : '회고하기'}
                </button>
              </div>
            </div>

            {/* Redo Confirmation Dialog */}
            {showRedoConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    회고를 다시 하시겠어요?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    이전 회고 기록은 삭제됩니다.
                    <br />
                    정말 다시하시겠습니까?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowRedoConfirm(false)}
                      disabled={isResetting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleRedoReflection}
                      disabled={isResetting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isResetting ? '처리 중...' : '다시하기'}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
