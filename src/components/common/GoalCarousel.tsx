import { useRef, useEffect } from 'react'

interface GoalCarouselProps {
  direction?: 'left' | 'right'
  className?: string
}

// SMART 기반 목표 예시들 - 구체적(Specific), 측정 가능(Measurable), 달성 가능(Achievable), 관련성(Relevant), 시간 제한(Time-bound)
const SMART_GOALS = [
  '영어 원서 5권 완독하고 주요 내용 요약 노트 5편 작성',
  '올해 총 저축액 6천만원 달성',
  '핵심 기술 4개를 학습해 적용 사례가 포함된 포트폴리오 1개 완성',
  '가족과의 정기적인 저녁 식사 기록 40회 이상 남기기',
  '온라인 강의 수료를 통해 관련 자격증 1개 취득',
  '도서 24권 완독 및 독서노트 24편 작성',
  '명상 습관을 정착시켜 총 300회 이상 실천',
  '새로운 취미 3가지 이상 경험하고 그중 1개를 지속 취미로 선정',
  '외국어 중급(B1~B2) 수준에 해당하는 공인 기준 충족',
  '네트워킹 모임 12회 이상 참여하고 의미 있는 관계 3건 이상 형성',
  '기술 블로그 누적 50개 게시물 발행',
]

export function GoalCarousel({ direction = 'left', className = '' }: GoalCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clone content for seamless loop
    const content = container.querySelector('.carousel-content') as HTMLElement
    if (!content) return

    // Animation using CSS
    const animationDuration = 60 // seconds

    content.style.animation = `scroll-${direction} ${animationDuration}s linear infinite`

    return () => {
      content.style.animation = ''
    }
  }, [direction])

  // Duplicate goals for seamless scrolling
  const displayGoals = [...SMART_GOALS, ...SMART_GOALS]

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <div className="carousel-content inline-flex gap-12">
        {displayGoals.map((goal, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 text-sm text-gray-400/70 font-medium"
          >
            <span className="w-1.5 h-1.5 bg-gray-300/50 rounded-full flex-shrink-0" />
            {goal}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
