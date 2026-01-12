import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { List, X, Wrench } from '@phosphor-icons/react'
import { useAuth } from '@/hooks'
import { Logo } from '@/components/common'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  if (!isAuthenticated) return null

  const isOnDashboard = location.pathname === '/dashboard'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDashboard = () => {
    setIsMenuOpen(false)
    navigate('/dashboard')
  }

  const handleSignOut = () => {
    setIsMenuOpen(false)
    signOut()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />

          {/* Hamburger Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <List size={24} className="text-gray-700" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User email */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500">로그인 계정</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {!isOnDashboard && (
                    <button
                      onClick={handleDashboard}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      대시보드
                    </button>
                  )}
                  {/* Admin menu - only for admin user */}
                  {user?.email === 'kangbeen.ko@gm.gist.ac.kr' && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        navigate('/admin')
                      }}
                      className="w-full px-4 py-2 text-left text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2"
                    >
                      <Wrench size={16} />
                      관리자 대시보드
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
