import { useMemo } from 'react'
import type { Mandala } from '@/types'
import type { ColorTheme } from '@/constants'

interface MandalaPreviewProps {
  mandala: Mandala
  colorTheme?: ColorTheme
}

const PALETTES = {
  pink: {
    background: '#FFF8F6',
    centerGoal: '#FFDDD2',
    subGoal: '#FFE8E0',
    border: '#C9897B',
    text: '#6B4F4F',
    gridBorder: '#E8C4BB',
  },
  blue: {
    background: '#F6F9FF',
    centerGoal: '#C5D8FF',
    subGoal: '#DBE6FF',
    border: '#7B97C9',
    text: '#4F5A6B',
    gridBorder: '#B4C5E8',
  },
  green: {
    background: '#F6FFF8',
    centerGoal: '#C5FFD2',
    subGoal: '#DBFFE4',
    border: '#7BC987',
    text: '#4F6B52',
    gridBorder: '#B4E8BB',
  },
  beige: {
    background: '#F5EFE6',
    centerGoal: '#E7D2BC',
    subGoal: '#F3E8DA',
    border: '#8B7355',
    text: '#2D2D2D',
    gridBorder: '#C4B49D',
  },
}

/**
 * Mandala PDF Preview Component
 * Renders the exact same layout as the PDF output (Vertical A4)
 */
export function MandalaPreview({ mandala, colorTheme = 'pink' }: MandalaPreviewProps) {
  const colors = PALETTES[colorTheme]
  const centerGoal = mandala.center_goal || '핵심 목표'
  const subGoals = mandala.sub_goals || []
  const actionPlans = mandala.action_plans || {}
  const keywords = mandala.ai_summary?.keywords || []

  // Helper function to determine font size based on text length
  const getFontSize = (text: string, baseSize: number): number => {
    const length = text?.length ?? 0
    if (length <= 4) return baseSize
    if (length <= 8) return Math.max(baseSize - 1, 7)
    if (length <= 12) return Math.max(baseSize - 2, 7)
    if (length <= 18) return Math.max(baseSize - 3, 6)
    if (length <= 25) return Math.max(baseSize - 4, 6)
    if (length <= 35) return Math.max(baseSize - 5, 5)
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
        const subGoal = isCenter ? '' : subGoals[subGoalIndex] || ''
        const plans = isCenter ? [] : actionPlans[subGoalIndex.toString()] || []

        const cells = []
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            let cellContent = ''
            let fontSize = 9
            let cellBg = 'white'
            let fontWeight = 500

            // Determine background color
            if (isCenter && isCenterCell) {
              cellBg = colors.centerGoal
            } else if ((isCenter && !isCenterCell) || (!isCenter && isCenterCell)) {
              cellBg = colors.subGoal
            }

            // Determine content and styling
            if (isCenter && isCenterCell) {
              cellContent = centerGoal
              fontSize = getFontSize(centerGoal, 12)
              fontWeight = 800
            } else if (isCenter && !isCenterCell) {
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || ''
              fontSize = getFontSize(cellContent, 10)
              fontWeight = 700
            } else if (!isCenter && isCenterCell) {
              cellContent = subGoal
              fontSize = getFontSize(subGoal, 10)
              fontWeight = 700
            } else if (!isCenter) {
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ''
              fontSize = getFontSize(cellContent, 9)
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
  }, [centerGoal, subGoals, actionPlans, colors])

  return (
    <div className="w-full overflow-x-auto">
      <div 
        className="min-w-[600px] flex flex-col gap-3 p-5 rounded-lg"
        style={{ 
          backgroundColor: colors.background,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
          color: colors.text,
        }}
      >
        {/* Header Section */}
        <div className="text-center pb-2">
          <div className="text-2xl font-extrabold mb-1" style={{ color: colors.text }}>
            2026
          </div>
          <div className="text-xl font-bold tracking-wide" style={{ color: colors.border }}>
            만다라트 차트
          </div>
        </div>

        {/* Keywords & Commitment Section */}
        <div 
          className="flex justify-between items-start gap-4 p-3 bg-white rounded-xl"
          style={{ border: `2px solid ${colors.gridBorder}` }}
        >
          {/* Left: Name & Keywords */}
          <div className="flex-1">
            <div className="text-sm font-bold mb-1">
              {mandala.name || '이름'}의 2026년 KEYWORD
            </div>
            <div className="text-xs leading-relaxed">
              {keywords.length > 0
                ? keywords.join(', ')
                : '키워드를 입력해주세요'}
            </div>
          </div>

          {/* Right: Commitment */}
          <div 
            className="flex-1 py-2 px-3 rounded-2xl text-center"
            style={{ 
              backgroundColor: colors.subGoal,
              border: `2px solid ${colors.border}`,
            }}
          >
            <div className="text-sm leading-relaxed">
              {mandala.commitment || '2026년 다짐을 입력해주세요!'}
            </div>
          </div>
        </div>

        {/* Mandala Grid */}
        <div 
          className="grid gap-1 justify-center"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
          }}
        >
          {gridSections.map((section) => (
            <div
              key={section.key}
              className="relative bg-white grid overflow-hidden rounded-lg"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                border: `2px solid ${colors.gridBorder}`,
                aspectRatio: '1',
              }}
            >
              {/* Section number */}
              {!section.isCenter && (
                <div 
                  className="absolute top-[3px] left-[5px] text-[9px] font-semibold z-10"
                  style={{ color: colors.border }}
                >
                  #{section.subGoalIndex + 1}
                </div>
              )}
              
              {section.cells.map((cell) => (
                <div
                  key={cell.key}
                  className="flex items-center justify-center text-center p-0.5"
                  style={{
                    backgroundColor: cell.cellBg,
                    fontSize: `${cell.fontSize}px`,
                    fontWeight: cell.fontWeight,
                    border: `1px solid ${colors.gridBorder}`,
                    lineHeight: `${Math.ceil(cell.fontSize * 1.45)}px`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center break-keep">
                    {cell.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] pt-1" style={{ color: colors.border }}>
          Created with 2026 만다라트 목표 설계
        </div>
      </div>
    </div>
  )
}
