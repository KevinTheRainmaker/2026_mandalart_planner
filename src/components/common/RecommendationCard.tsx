import { useState } from 'react'
import { Sparkle, ArrowClockwise, Check } from '@phosphor-icons/react'
import { Button } from './Button'
import { Loading } from './Loading'
import type { Recommendation } from '@/services'

interface RecommendationCardProps {
  title: string
  onGenerate: () => Promise<Recommendation[]>
  onSelect: (text: string) => void
}

export function RecommendationCard({
  title,
  onGenerate,
  onSelect,
}: RecommendationCardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setSelectedIndex(null)
    try {
      const results = await onGenerate()
      setRecommendations(results)
      setHasGenerated(true)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (recommendation: Recommendation, index: number) => {
    setSelectedIndex(index)
    onSelect(recommendation.text)
  }

  if (!hasGenerated) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-purple-600" />
            <span className="font-medium text-purple-900">{title}</span>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loading size="sm" /> 생성 중...
              </>
            ) : (
              <>
                <Sparkle size={16} weight="bold" /> AI 추천받기
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-purple-600" />
          <span className="font-medium text-purple-900">{title}</span>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <Loading size="sm" />
          ) : (
            <ArrowClockwise size={14} weight="bold" />
          )}
          다시 추천
        </Button>
      </div>

      {isLoading ? (
        <div className="py-4 text-center">
          <Loading size="md" message="SMART 기준으로 추천을 생성하고 있어요..." />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => handleSelect(rec, index)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedIndex === index
                  ? 'border-purple-500 bg-purple-100'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    selectedIndex === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {selectedIndex === index ? (
                    <Check size={12} weight="bold" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 break-words">
                    {rec.text}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 py-2">
          추천을 생성하지 못했어요. 다시 시도해주세요.
        </p>
      )}
    </div>
  )
}
