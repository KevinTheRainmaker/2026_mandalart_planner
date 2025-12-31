import { useAuth } from '@/hooks'
import { Button } from '@/components/common'

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth()

  if (!isAuthenticated) return null

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">
            2026 만다라트 목표 설계
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
