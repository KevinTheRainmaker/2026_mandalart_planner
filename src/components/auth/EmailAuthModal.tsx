import { useState, FormEvent } from 'react'
import { Modal, Input, Checkbox, Button, Loading } from '@/components/common'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/utils/validators'

interface EmailAuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'start' | 'continue'
}

export function EmailAuthModal({ isOpen, onClose, mode }: EmailAuthModalProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }

    // 시작하기 모드에서만 동의 확인
    if (mode === 'start' && !consent) {
      setError('개인정보 수집 및 이용에 동의해주세요')
      return
    }

    setIsLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback?mode=${mode}`,
          data: {
            marketing_consent: mode === 'start' ? marketingConsent : false,
          },
        },
      })

      if (authError) throw authError

      setSent(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '이메일 발송에 실패했습니다'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 8) return

    setIsVerifying(true)
    setError('')

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      })

      if (verifyError) throw verifyError

      // 인증 성공 - AuthCallback과 동일한 로직을 타도록 리다이렉트
      window.location.href = `/auth/callback?mode=${mode}`
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증번호가 올바르지 않습니다'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleVerifyOtp()
    }
  }

  const handleClose = () => {
    setEmail('')
    setConsent(false)
    setMarketingConsent(false)
    setError('')
    setSent(false)
    setOtpCode('')
    onClose()
  }

  if (sent) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="이메일 확인">
        <div className="py-6">
          <div className="text-center mb-6">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              인증 메일을 발송했습니다
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{email}</span>로 발송된 이메일의
              <br />
              인증번호 8자리를 입력해주세요.
            </p>
          </div>

          {/* OTP Code Input */}
          <div className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleOtpKeyPress}
              placeholder="00000000"
              className="w-full text-center text-2xl font-mono tracking-[0.5em] px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none"
              autoFocus
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={otpCode.length !== 8 || isVerifying}
            >
              {isVerifying ? <Loading size="sm" /> : '인증하기'}
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              같은 기기에서는 이메일의 로그인 링크를 클릭해도 됩니다.
            </p>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'start' ? '시작하기' : '이어하기'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="이메일 주소"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !validateEmail(email) ? error : undefined}
          required
        />

        {mode === 'start' && (
          <div className="space-y-3">
            <Checkbox
              label="(필수) 서비스 이용을 위한 개인정보 수집에 동의합니다"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <Checkbox
              label="(선택) 현재 서비스 및 새로운 서비스 소식을 이메일로 받아보고 싶어요"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loading size="sm" /> : '인증 메일 받기'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          인증 메일이 발송되며, 인증번호 입력 또는 링크 클릭으로 로그인됩니다.
        </p>
      </form>
    </Modal>
  )
}
