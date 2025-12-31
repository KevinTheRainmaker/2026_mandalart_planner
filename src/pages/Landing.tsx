import { useState } from 'react'
import { Button } from '@/components/common'
import { EmailAuthModal } from '@/components/auth'
import { Container } from '@/components/layout'

export function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleStart = () => {
    setShowAuthModal(true)
  }

  const handleContinue = () => {
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <Container>
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              2026 만다라트 목표 설계
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              14일간의 여정을 통해 2025년을 돌아보고,
              <br />
              2026년 목표를 실행 가능한 계획으로 만들어보세요
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-lg mb-2">Day 1-2</h3>
              <p className="text-gray-600 text-sm">
                2025년 회고를 통해 지난 한 해를 돌아봅니다
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Day 3-13</h3>
              <p className="text-gray-600 text-sm">
                목표와 실행 계획을 구체화합니다
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">Day 14</h3>
              <p className="text-gray-600 text-sm">
                만다라트 그리드로 전체 계획을 시각화합니다
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

      <EmailAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
