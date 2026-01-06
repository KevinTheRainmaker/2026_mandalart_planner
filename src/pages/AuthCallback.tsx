import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { createMandala } from '@/lib/api'
import { Loading } from '@/components/common'

// Key for cross-tab auth communication
const AUTH_SUCCESS_KEY = 'mandala_auth_success'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          throw error
        }

        if (session) {
          console.log('Session found:', session.user.email)
          // auth_mode를 URL 쿼리 파라미터에서 읽음 (user_metadata는 최초 생성 시 고정되므로 사용 불가)
          const urlParams = new URLSearchParams(window.location.search)
          const authMode = urlParams.get('mode') || 'start'
          console.log('Auth mode:', authMode)

          // Check if user has existing mandala for 2026
          const { data: existingMandala, error: fetchError } = await supabase
            .from('mandalas')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('year', 2026)
            .maybeSingle()

          if (fetchError) {
            console.error('Mandala fetch error:', fetchError)
            throw fetchError
          }

          console.log('Existing mandala:', existingMandala ? 'found' : 'not found')

          // Handle "continue" mode - must have existing mandala
          if (authMode === 'continue' && !existingMandala) {
            console.error('Continue mode but no existing mandala')
            alert('등록되지 않은 이메일입니다. "새로 시작하기"를 이용해주세요.')
            navigate('/', { replace: true })
            return
          }

          let redirectPath = '/dashboard'

          if (existingMandala) {
            // Existing user - redirect to dashboard
            console.log('Redirecting to dashboard')
            redirectPath = '/dashboard'
          } else {
            // New user - create mandala and redirect to Day 1
            console.log('Creating new mandala')
            const marketingConsent = session.user.user_metadata?.marketing_consent || false

            const newMandala = await createMandala({
              user_id: session.user.id,
              user_email: session.user.email,
              year: 2026,
              marketing_consent: marketingConsent,
            })

            console.log('Mandala created:', newMandala)
            console.log('Redirecting to step 1')
            redirectPath = '/step/1'
          }

          // Broadcast auth success to other tabs
          localStorage.setItem(AUTH_SUCCESS_KEY, JSON.stringify({
            timestamp: Date.now(),
            redirect: redirectPath,
          }))

          // Small delay to ensure broadcast is received
          setTimeout(() => {
            // Clear the broadcast
            localStorage.removeItem(AUTH_SUCCESS_KEY)
            
            // Show success message and try to close the tab
            alert('로그인에 성공하였습니다!\n\n기존 탭으로 돌아가 진행해주세요.')
            
            // Try to close this tab (may not work due to browser security)
            window.close()
            
            // Wait a bit to see if window closed, only navigate if it didn't
            setTimeout(() => {
              // If we're still here, window.close() didn't work, so navigate
              navigate(redirectPath, { replace: true })
            }, 500)
          }, 100)

        } else {
          // No session, redirect to home
          console.log('No session found')
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        alert(`로그인 처리 중 오류가 발생했습니다.\n\n오류 내용: ${errorMessage}\n\n브라우저 콘솔을 확인해주세요.`)
        navigate('/', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" message="로그인 처리 중..." />
    </div>
  )
}
