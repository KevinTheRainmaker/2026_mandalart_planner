import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilSimple, ChartBar } from '@phosphor-icons/react'
import { Container, Header } from '@/components/layout'
import { MandalaGrid, type MandalaGridRef } from '@/components/mandala'
import { Button, Loading } from '@/components/common'
import { useAuth, useMandala } from '@/hooks'
import { generateAIReport, generateMandalaPDF } from '@/services'
import type { AISummary } from '@/types'

export function Day13() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiReport, setAiReport] = useState<AISummary | null>(
    mandala?.ai_summary || null
  )
  const mandalaGridRef = useRef<HTMLDivElement>(null)
  const mandalaGridComponentRef = useRef<MandalaGridRef>(null)

  const handleGenerateReport = async () => {
    if (!mandala) return

    setIsGenerating(true)
    try {
      console.log('Starting AI report generation...')
      const report = await generateAIReport(mandala)
      console.log('AI report generated successfully:', report)
      setAiReport(report)

      await updateMandala({
        ai_summary: report,
        completed_days: [...(mandala.completed_days || []), 13],
      })
      console.log('Mandala updated with AI report')
    } catch (error) {
      console.error('Failed to generate AI report:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`AI 리포트 생성에 실패했습니다.\n\n오류: ${errorMessage}\n\n브라우저 콘솔을 확인해주세요.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditMandala = () => {
    navigate('/mandala/edit')
  }

  const handleDownloadMandala = async () => {
    if (!mandalaGridRef.current || !mandala) return

    try {
      // 먼저 이름과 다짐을 저장
      if (mandalaGridComponentRef.current) {
        await mandalaGridComponentRef.current.saveChanges()
      }

      console.log('Downloading PDF with mandala data:', {
        name: mandala.name,
        commitment: mandala.commitment,
        center_goal: mandala.center_goal
      })

      const today = new Date().toISOString().split('T')[0]
      await generateMandalaPDF(mandalaGridRef.current, mandala, `mandala-chart-${today}.pdf`)
    } catch (error) {
      console.error('Failed to download Mandala PDF:', error)
      alert('PDF 다운로드에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="로딩 중..." />
      </div>
    )
  }

  if (!mandala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600">만다라트를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              종합 리포트
            </h1>
            <p className="text-gray-600">
              지금까지의 여정을 AI가 분석한 종합 리포트입니다.
            </p>
          </div>

          {/* Generate Report Button */}
          {!aiReport && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                AI 종합 리포트 생성
              </h2>
              <p className="text-gray-600 mb-6">
                AI가 회고와 목표를 분석하여 종합 리포트를 생성합니다.
              </p>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? '생성 중...' : 'AI 리포트 생성하기'}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
              <Loading size="lg" message="AI가 리포트를 생성하고 있습니다..." />
            </div>
          )}

          {/* AI Report */}
          {aiReport && !isGenerating && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  회고 요약
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {aiReport.reflection_summary}
                </p>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  목표 구조 분석
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {aiReport.goal_analysis}
                </p>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  핵심 키워드
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiReport.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  통합 인사이트
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {aiReport.insights}
                </p>
              </div>

              {/* Edit Mandala Button */}
              <div className="flex justify-center">
                <Button onClick={handleEditMandala} variant="primary" size="lg" className="flex items-center gap-2">
                  <PencilSimple size={20} weight="bold" /> 만다라트 수정하러 가기
                </Button>
              </div>
            </div>
          )}

          {/* Mandala Grid */}
          {aiReport && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                만다라트 9×9 그리드
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                이름과 다짐을 입력하고 PDF로 저장하세요.
              </p>
              <div ref={mandalaGridRef}>
                <MandalaGrid ref={mandalaGridComponentRef} mandala={mandala} onUpdate={updateMandala} />
              </div>
              <div className="flex justify-center mt-6">
                <Button onClick={handleDownloadMandala} variant="secondary" size="lg" className="flex items-center gap-2">
                  <ChartBar size={20} weight="bold" /> 만다라트 계획서 PDF 다운로드
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
