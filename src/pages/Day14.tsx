import { Container, Header } from '@/components/layout'
import { useAuth, useMandala } from '@/hooks'
import { Loading } from '@/components/common'

export function Day14() {
  const { user } = useAuth()
  const { isLoading } = useMandala(user?.id)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="로딩 중..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            추가 기능 준비 중
          </h1>
          <p className="text-gray-600 mb-6">
            새로운 기능이 곧 추가됩니다. 기대해주세요!
          </p>
        </div>
      </Container>
    </div>
  )
}
