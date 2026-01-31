import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilSimple, ChartBar, ArrowClockwise } from '@phosphor-icons/react'
import { Container, Header } from '@/components/layout'
import { MandalaPreview } from '@/components/mandala'
import { Button, Loading } from '@/components/common'
import { useAuth, useMandala } from '@/hooks'
import { useMandalaStore } from '@/store'
import { generateAIReport, generateMandalaPDF } from '@/services'
import { updateMandala as updateMandalaApi } from '@/lib/api'
import type { AISummary } from '@/types'

// 만다라 콘텐츠 해시 생성 (AI 분석에 영향을 주는 필드들만)
function getContentHash(mandala: {
  reflection_theme?: string | null
  reflection_answers?: Record<string, string>
  reflection_notes?: string | null
  center_goal?: string | null
  sub_goals?: string[]
  action_plans?: Record<string, string[]>
}): string {
  const content = JSON.stringify({
    reflection_theme: mandala.reflection_theme || '',
    reflection_answers: mandala.reflection_answers || {},
    reflection_notes: mandala.reflection_notes || '',
    center_goal: mandala.center_goal || '',
    sub_goals: mandala.sub_goals || [],
    action_plans: mandala.action_plans || {},
  })
  // 간단한 해시 생성
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

export function Day13() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mandala, isLoading, updateMandala } = useMandala(user?.id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiReport, setAiReport] = useState<AISummary | null>(
    mandala?.ai_summary || null
  )
  
  // Editable name and commitment
  const [editableName, setEditableName] = useState(mandala?.name || '')
  const [editableCommitment, setEditableCommitment] = useState(mandala?.commitment || '')
  const [isSaving, setIsSaving] = useState(false)
  const { setMandala } = useMandalaStore()

  // 현재 만다라 콘텐츠 해시
  const currentHash = useMemo(() => {
    if (!mandala) return ''
    return getContentHash(mandala)
  }, [mandala])

  // 실제 콘텐츠 변경 여부 확인 (저장된 해시와 현재 해시 비교)
  const hasContentChanges = useMemo(() => {
    // AI 리포트가 없거나 저장된 해시가 없으면 false
    const storedHash = mandala?.ai_summary?.content_hash
    if (!aiReport || !storedHash) return false
    return currentHash !== storedHash
  }, [aiReport, currentHash, mandala?.ai_summary?.content_hash])

  const handleGenerateReport = async () => {
    if (!mandala) return

    setIsGenerating(true)
    try {
      console.log('Starting AI report generation...')
      const report = await generateAIReport(mandala)
      console.log('AI report generated successfully:', report)
      
      // 리포트에 현재 해시 포함
      const reportWithHash: AISummary = {
        ...report,
        content_hash: currentHash,
      }
      
      setAiReport(reportWithHash)

      await updateMandala({
        ai_summary: reportWithHash,
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

  const handleRegenerateReport = async () => {
    if (!mandala || !hasContentChanges) return

    setIsGenerating(true)
    try {
      console.log('Regenerating AI report with updated content...')
      const report = await generateAIReport(mandala)
      console.log('AI report regenerated successfully:', report)
      
      // 리포트에 현재 해시 포함
      const reportWithHash: AISummary = {
        ...report,
        content_hash: currentHash,
      }
      
      setAiReport(reportWithHash)

      await updateMandala({
        ai_summary: reportWithHash,
      })
      console.log('Mandala updated with regenerated AI report')
    } catch (error) {
      console.error('Failed to regenerate AI report:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`AI 리포트 재생성에 실패했습니다.\n\n오류: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditMandala = () => {
    navigate('/mandala/edit')
  }

  const handleNameBlur = async () => {
    if (!mandala?.id || editableName === mandala.name) return
    setIsSaving(true)
    try {
      const updated = await updateMandalaApi(mandala.id, { name: editableName })
      if (updated) {
        setMandala(updated)
      }
    } catch (error) {
      console.error('Failed to update name:', error)
      setEditableName(mandala.name || '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCommitmentBlur = async () => {
    if (!mandala?.id || editableCommitment === mandala.commitment) return
    setIsSaving(true)
    try {
      const updated = await updateMandalaApi(mandala.id, { commitment: editableCommitment })
      if (updated) {
        setMandala(updated)
      }
    } catch (error) {
      console.error('Failed to update commitment:', error)
      setEditableCommitment(mandala.commitment || '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadMandala = async () => {
    if (!mandala) return

    try {
      // Save current name and commitment before download
      if (mandala.id) {
        const updates: Record<string, string> = {}
        if (editableName !== mandala.name) updates.name = editableName
        if (editableCommitment !== mandala.commitment) updates.commitment = editableCommitment
        
        if (Object.keys(updates).length > 0) {
          const updated = await updateMandalaApi(mandala.id, updates)
          if (updated) {
            setMandala(updated)
          }
        }
      }

      // Get latest mandala from store
      const latestMandala = useMandalaStore.getState().mandala
      if (!latestMandala) {
        throw new Error('Mandala data not found after save')
      }

      console.log('Downloading PDF with mandala data:', {
        name: latestMandala.name,
        commitment: latestMandala.commitment,
        center_goal: latestMandala.center_goal
      })

      const today = new Date().toISOString().split('T')[0]
      await generateMandalaPDF(null, latestMandala, `mandala-chart-${today}.pdf`)
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
                AI가 당신의 회고와 목표를 분석하여 리포트를 생성합니다.
              </p>
              <p className='text-gray-600 mb-6'>
                SMART 프레임워크를 기반으로 당신의 만다라트 차트를 분석하고 개선에 바로 활용할 수 있는 피드백을 제공합니다.
              </p>
              <p className='text-gray-600 mb-6'>
                피드백을 바탕으로 만다라트 차트를 개선해보세요.
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

              {/* Edit Mandala & Regenerate Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                <Button onClick={handleEditMandala} variant="primary" size="lg" className="flex items-center gap-2">
                  <PencilSimple size={20} weight="bold" /> 만다라트 수정하러 가기
                </Button>
                <Button
                  onClick={handleRegenerateReport}
                  variant="outline"
                  size="lg"
                  disabled={!hasContentChanges || isGenerating}
                  className="flex items-center gap-2"
                  title={hasContentChanges ? '수정된 내용으로 AI 피드백을 다시 받습니다' : '수정된 내용이 없습니다'}
                >
                  <ArrowClockwise size={20} weight="bold" /> AI 피드백 다시 받기
                </Button>
              </div>

              {/* Change indicator */}
              {hasContentChanges && (
                <p className="text-center text-sm text-amber-600">
                  ⚠️ 만다라트가 수정되었습니다. AI 피드백을 다시 받아보세요!
                </p>
              )}
            </div>
          )}

          {/* PDF Download Section */}
          {aiReport && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                만다라트 계획서 다운로드
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                이름과 다짐을 입력하고 PDF로 저장하세요.
              </p>
              
              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 {isSaving && <span className="text-xs text-gray-500">(저장 중...)</span>}
                </label>
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  onBlur={handleNameBlur}
                  disabled={isSaving}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Keywords Display */}
              {mandala.ai_summary?.keywords && mandala.ai_summary.keywords.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    핵심 키워드
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {mandala.ai_summary.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Commitment Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  다짐 {isSaving && <span className="text-xs text-gray-500">(저장 중...)</span>}
                </label>
                <textarea
                  value={editableCommitment}
                  onChange={(e) => setEditableCommitment(e.target.value)}
                  onBlur={handleCommitmentBlur}
                  disabled={isSaving}
                  placeholder="올해의 다짐을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Download Button */}
              <div className="flex justify-center mb-8">
                <Button onClick={handleDownloadMandala} variant="secondary" size="lg" className="flex items-center gap-2">
                  <ChartBar size={20} weight="bold" /> 만다라트 계획서 PDF 다운로드
                </Button>
              </div>
              
              {/* PDF Preview */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📄 PDF 미리보기
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  실제 PDF에 표시될 내용입니다. 이름과 다짐을 입력하면 미리보기에 반영됩니다.
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner bg-gray-100 p-2">
                  <MandalaPreview mandala={{...mandala, name: editableName, commitment: editableCommitment}} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
