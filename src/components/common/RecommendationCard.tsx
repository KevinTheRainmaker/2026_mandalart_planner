import { useState } from 'react'
import { Sparkle, ArrowClockwise, Check, Copy, ThumbsUp, ThumbsDown } from '@phosphor-icons/react'
import { Button } from './Button'
import { Loading } from './Loading'
import type { Recommendation } from '@/services'
import { saveRecommendationFeedback } from '@/services'

interface RecommendationCardProps {
  title: string
  onGenerate: () => Promise<Recommendation[]>
  onSelect: (text: string) => void
  recommendationType: 'subGoal' | 'actionPlan'
  centerGoal: string
  subGoal?: string
}

export function RecommendationCard({
  title,
  onGenerate,
  onSelect,
  recommendationType,
  centerGoal,
  subGoal,
}: RecommendationCardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'upvote' | 'downvote'>>({})

  const handleGenerate = async () => {
    setIsLoading(true)
    setSelectedIndex(null)
    setCopiedIndex(null)
    setFeedbackGiven({})
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

  const handleCopy = async (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleFeedback = async (
    rec: Recommendation,
    index: number,
    feedback: 'upvote' | 'downvote',
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    
    // Optimistically update UI
    setFeedbackGiven(prev => ({ ...prev, [index]: feedback }))
    
    // Save to database
    await saveRecommendationFeedback({
      type: recommendationType,
      recommendationText: rec.text,
      reason: rec.reason,
      feedback,
      centerGoal,
      subGoal,
    })
  }

  if (!hasGenerated) {
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
        {isLoading && (
          <div className="py-4 text-center">
            <Loading size="md" message="SMART 프레임워크 기준으로 추천을 생성하고 있어요..." />
          </div>
        )}
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
            <div
              key={index}
              onClick={() => handleSelect(rec, index)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
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
                
                {/* Feedback & Copy Buttons */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Upvote Button */}
                  <button
                    onClick={(e) => handleFeedback(rec, index, 'upvote', e)}
                    className={`p-1.5 rounded-md transition-all ${
                      feedbackGiven[index] === 'upvote'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                    }`}
                    title="좋은 추천이에요"
                    disabled={feedbackGiven[index] !== undefined}
                  >
                    <ThumbsUp size={14} weight={feedbackGiven[index] === 'upvote' ? 'fill' : 'regular'} />
                  </button>
                  
                  {/* Downvote Button */}
                  <button
                    onClick={(e) => handleFeedback(rec, index, 'downvote', e)}
                    className={`p-1.5 rounded-md transition-all ${
                      feedbackGiven[index] === 'downvote'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title="개선이 필요해요"
                    disabled={feedbackGiven[index] !== undefined}
                  >
                    <ThumbsDown size={14} weight={feedbackGiven[index] === 'downvote' ? 'fill' : 'regular'} />
                  </button>
                  
                  {/* Copy Button */}
                  <button
                    onClick={(e) => handleCopy(rec.text, index, e)}
                    className={`p-1.5 rounded-md transition-all ${
                      copiedIndex === index
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                    }`}
                    title="복사하기"
                  >
                    {copiedIndex === index ? (
                      <Check size={14} weight="bold" />
                    ) : (
                      <Copy size={14} weight="bold" />
                    )}
                  </button>
                </div>
              </div>
            </div>
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
