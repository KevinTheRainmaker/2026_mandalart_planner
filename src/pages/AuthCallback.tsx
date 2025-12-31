import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { createMandala } from '@/lib/api'
import { Loading } from '@/components/common'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          // Check if user has existing mandala for 2026
          const { data: existingMandala, error: fetchError } = await supabase
            .from('mandalas')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('year', 2026)
            .maybeSingle()

          if (fetchError) throw fetchError

          if (existingMandala) {
            // Existing user - redirect to dashboard
            navigate('/dashboard', { replace: true })
          } else {
            // New user - create mandala and redirect to Day 1
            const marketingConsent = session.user.user_metadata?.marketing_consent || false

            await createMandala({
              user_id: session.user.id,
              year: 2026,
              marketing_consent: marketingConsent,
            })

            navigate('/day/1', { replace: true })
          }
        } else {
          // No session, redirect to home
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
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
