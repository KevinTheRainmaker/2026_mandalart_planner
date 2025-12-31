import { useState, FormEvent } from 'react'
import { Modal, Input, Checkbox, Button, Loading } from '@/components/common'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/utils/validators'

interface EmailAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailAuthModal({ isOpen, onClose }: EmailAuthModalProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('올바른 이메일 주소를 입력해주세요')
      return
    }

    if (!consent) {
      setError('개인정보 수집 및 이용에 동의해주세요')
      return
    }

    setIsLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
          data: {
            marketing_consent: marketingConsent,
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

  const handleClose = () => {
    setEmail('')
    setConsent(false)
    setMarketingConsent(false)
    setError('')
    setSent(false)
    onClose()
  }

  if (sent) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="이메일 확인">
        <div className="text-center py-8">
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
            인증 링크를 발송했습니다
          </h3>
          <p className="text-gray-600 mb-6">
            {email}로 발송된 이메일의 링크를 클릭하여 로그인해주세요.
          </p>
          <Button onClick={handleClose}>확인</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="시작하기">
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

        <div className="space-y-3">
          <Checkbox
            label="(필수) 개인정보 수집 및 이용에 동의합니다"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <Checkbox
            label="(선택) 마케팅 정보 수신에 동의합니다"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loading size="sm" /> : '인증 링크 받기'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          인증 링크는 이메일로 발송되며, 클릭 시 자동으로 로그인됩니다.
        </p>
      </form>
    </Modal>
  )
}
