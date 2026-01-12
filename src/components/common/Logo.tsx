import { Target } from '@phosphor-icons/react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 24, text: 'text-lg' },
  lg: { icon: 32, text: 'text-xl' },
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Target size={icon} weight="duotone" className="text-primary-600" />
      {showText && (
        <span className={`font-bold text-primary-600 ${text}`}>
          2026 만다라트 목표 설계
        </span>
      )}
    </div>
  )
}
