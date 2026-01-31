import { useMemo } from 'react'
import type { Mandala } from '@/types'

interface MandalaPreviewProps {
  mandala: Mandala
}

/**
 * Mandala PDF Preview Component
 * Renders the exact same layout as the PDF output
 */
export function MandalaPreview({ mandala }: MandalaPreviewProps) {
  const centerGoal = mandala.center_goal || '핵심 목표'
  const subGoals = mandala.sub_goals || []
  const actionPlans = mandala.action_plans || {}
  const keywords = mandala.ai_summary?.keywords || []

  // Helper function to determine font size based on text length
  const getFontSize = (text: string, baseSize: number): number => {
    const length = text?.length ?? 0
    if (length <= 5) return baseSize
    if (length <= 10) return Math.max(baseSize - 1, 7)
    if (length <= 15) return Math.max(baseSize - 2, 7)
    if (length <= 20) return Math.max(baseSize - 3, 6)
    if (length <= 30) return Math.max(baseSize - 4, 6)
    if (length <= 40) return Math.max(baseSize - 5, 5)
    return Math.max(baseSize - 6, 5)
  }

  // Generate grid cells for each section
  const gridSections = useMemo(() => {
    const sections = []
    for (let sectionRow = 0; sectionRow < 3; sectionRow++) {
      for (let sectionCol = 0; sectionCol < 3; sectionCol++) {
        const sectionIndex = sectionRow * 3 + sectionCol
        const isCenter = sectionIndex === 4
        const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
        const subGoal = isCenter ? '' : subGoals[subGoalIndex] || '세부 목표'
        const plans = isCenter ? [] : actionPlans[subGoalIndex.toString()] || []

        const cells = []
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            let cellContent = ''
            let fontSize = 8
            let cellBg = 'white'
            let fontWeight = 500

            // Determine background color
            if (isCenter && isCenterCell) {
              cellBg = '#E7D2BC' // BEIGE_DARK
            } else if ((isCenter && !isCenterCell) || (!isCenter && isCenterCell)) {
              cellBg = '#F3E8DA' // BEIGE_LIGHT
            }

            // Determine content and styling
            if (isCenter && isCenterCell) {
              cellContent = centerGoal
              fontSize = getFontSize(centerGoal, 11)
              fontWeight = 700
            } else if (isCenter && !isCenterCell) {
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || '세부 목표'
              fontSize = getFontSize(cellContent, 9)
              fontWeight = 600
            } else if (!isCenter && isCenterCell) {
              cellContent = subGoal
              fontSize = getFontSize(subGoal, 10)
              fontWeight = 700
            } else if (!isCenter) {
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ''
              fontSize = getFontSize(cellContent, 8)
              fontWeight = 500
            }

            cells.push({
              key: `${sectionIndex}-${cellIndex}`,
              content: cellContent,
              fontSize,
              fontWeight,
              cellBg,
            })
          }
        }

        sections.push({
          key: sectionIndex,
          isCenter,
          subGoalIndex,
          cells,
        })
      }
    }
    return sections
  }, [centerGoal, subGoals, actionPlans])

  return (
    <div className="w-full overflow-x-auto">
      <div 
        className="min-w-[900px] flex gap-4 p-4 rounded-lg"
        style={{ 
          backgroundColor: '#F5EFE6',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
        }}
      >
        {/* Left Panel - Title, Keywords, Commitment */}
        <div className="flex-shrink-0 w-[200px] text-[#2D2D2D]">
          {/* Title Section */}
          <div className="mb-6">
            <div className="text-lg font-extrabold mb-1">
              {mandala.name || '이름'}의
            </div>
            <div className="text-base font-extrabold">2026 만다라트</div>
          </div>

          {/* Keywords Section */}
          <div className="mb-6">
            <div className="text-sm font-extrabold mb-1">keyword</div>
            <div className="text-xs leading-relaxed mb-1">
              {keywords.length > 0
                ? keywords.slice(0, 4).join(', ')
                : '키워드 3~5개를 적어주세요!'}
            </div>
            <div className="border-b-2 border-[#2D2D2D] w-[160px]" />
          </div>

          {/* Commitment Section */}
          <div>
            <div className="text-sm font-extrabold mb-2">다짐 한 마디!!</div>
            <div className="text-xs leading-relaxed mb-2 break-keep">
              {mandala.commitment || '다짐을 입력해주세요'}
            </div>
            <div className="border-b-2 border-[#2D2D2D] w-[160px]" />
          </div>
        </div>

        {/* Right Panel - Mandala Grid */}
        <div 
          className="flex-1 grid gap-1"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
          }}
        >
          {gridSections.map((section) => (
            <div
              key={section.key}
              className="relative bg-white border-[3px] border-[#333] grid"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                aspectRatio: '1',
              }}
            >
              {/* Section number */}
              {!section.isCenter && (
                <div className="absolute top-[2px] left-[2px] text-[8px] text-gray-500 z-10">
                  #{section.subGoalIndex + 1}
                </div>
              )}
              
              {section.cells.map((cell) => (
                <div
                  key={cell.key}
                  className="border border-gray-200 grid place-items-center text-center p-1 overflow-hidden"
                  style={{
                    backgroundColor: cell.cellBg,
                    fontSize: `${cell.fontSize}px`,
                    fontWeight: cell.fontWeight,
                  }}
                >
                  <div 
                    className="w-full break-keep overflow-hidden"
                    style={{
                      lineHeight: `${Math.ceil(cell.fontSize * 1.45)}px`,
                      maxHeight: `${3 * Math.ceil(cell.fontSize * 1.45) + 6}px`,
                    }}
                  >
                    {cell.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
