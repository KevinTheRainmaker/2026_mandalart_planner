import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Target, ChartBar } from '@phosphor-icons/react'
import { Button, GoalCarousel } from '@/components/common'
import { EmailAuthModal } from '@/components/auth'
import { Container } from '@/components/layout'

export function Landing() {
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'start' | 'continue'>('start')

  // Listen for auth success from other tabs via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('mandala_auth')
    
    channel.onmessage = (event) => {
      if (event.data.type === 'AUTH_SUCCESS' && event.data.redirect) {
        console.log('Auth success detected from another tab:', event.data)
        // Send acknowledgment back
        channel.postMessage({ type: 'AUTH_ACK' })
        // Navigate to the redirect path
        navigate(event.data.redirect, { replace: true })
      }
    }

    return () => channel.close()
  }, [navigate])

  const handleStart = () => {
    setAuthMode('start')
    setShowAuthModal(true)
  }

  const handleContinue = () => {
    setAuthMode('continue')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Top Carousel */}
      <div className="py-4 bg-white/30 backdrop-blur-sm border-b border-gray-200/30">
        <GoalCarousel direction="left" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Container>
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">
                2026 만다라트 목표 설계
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                열심히 살아온 2025년을 돌아보고,
                <br />
                앞으로의 희망찬 2026년을 계획해보세요.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-3">
                  <MagnifyingGlass size={48} weight="duotone" className="text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2025 돌아보기</h3>
                <p className="text-gray-600 text-sm">
                  2025년 회고를 통해 지난 한 해를 돌아봅니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-3">
                  <Target size={48} weight="duotone" className="text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2026 계획하기</h3>
                <p className="text-gray-600 text-sm">
                  목표와 실행 계획을 구체화합니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-3">
                  <ChartBar size={48} weight="duotone" className="text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">만다라트 완성하기</h3>
                <p className="text-gray-600 text-sm">
                  만다라트 계획표를 완성하고 출력할 수 있습니다
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mt-12">
              <Button size="lg" onClick={handleStart}>
                새로 시작하기
              </Button>
              <Button variant="outline" size="lg" onClick={handleContinue}>
                이어하기
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              이메일로 간편하게 로그인하고 어디서든 이어서 작성할 수 있습니다
            </p>
          </div>
        </Container>
      </div>

      {/* Bottom Carousel */}
      <div className="py-4 bg-white/30 backdrop-blur-sm border-t border-gray-200/30">
        <GoalCarousel direction="right" />
      </div>

      <EmailAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  )
}
