import { useMemo } from 'react'
import type { Mandala } from '@/types'
import type { ColorTheme } from '@/constants'

export type PdfOrientation = 'portrait' | 'landscape'

interface MandalaPreviewProps {
  mandala: Mandala
  colorTheme?: ColorTheme
  orientation?: PdfOrientation
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
 * Renders the exact same layout as the PDF output
 * - portrait: Vertical A4
 * - landscape: Horizontal 16:9 wallpaper (left blank for desktop icons, content on right)
 */
export function MandalaPreview({ mandala, colorTheme = 'pink', orientation = 'portrait' }: MandalaPreviewProps) {
  const colors = PALETTES[colorTheme]
  const centerGoal = mandala.center_goal || '핵심 목표'
  const subGoals = mandala.sub_goals || []
  const actionPlans = mandala.action_plans || {}
  const keywords = mandala.ai_summary?.keywords || []
  const isLandscape = orientation === 'landscape'

  // Helper function to determine font size based on text length
  const getFontSize = (text: string, baseSize: number): number => {
    const length = text?.length ?? 0
    if (length <= 4) return baseSize
    if (length <= 8) return Math.max(baseSize - 2, 12)
    if (length <= 12) return Math.max(baseSize - 4, 11)
    if (length <= 18) return Math.max(baseSize - 6, 10)
    if (length <= 25) return Math.max(baseSize - 8, 9)
    if (length <= 35) return Math.max(baseSize - 10, 8)
    return Math.max(baseSize - 12, 7)
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
              fontSize = getFontSize(centerGoal, 20)
              fontWeight = 800
            } else if (isCenter && !isCenterCell) {
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || ''
              fontSize = getFontSize(cellContent, 16)
              fontWeight = 700
            } else if (!isCenter && isCenterCell) {
              cellContent = subGoal
              fontSize = getFontSize(subGoal, 16)
              fontWeight = 700
            } else if (!isCenter) {
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ''
              fontSize = getFontSize(cellContent, 14)
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

  // Shared grid renderer
  const renderGrid = () => (
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
              className="flex items-center justify-center text-center p-0.5 overflow-hidden"
              style={{
                backgroundColor: cell.cellBg,
                fontSize: `${cell.fontSize}px`,
                fontWeight: cell.fontWeight,
                border: `1px solid ${colors.gridBorder}`,
                lineHeight: `${Math.ceil(cell.fontSize * 1.2)}px`,
                wordBreak: 'break-all',
              }}
            >
              <span className="w-full">
                {cell.content}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  // ─── Landscape layout (for desktop wallpaper) ───
  if (isLandscape) {
    return (
      <div className="w-full overflow-x-auto">
        <div
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: colors.background,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
            color: colors.text,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Left blank area (~35%) for desktop icons */}
          <div style={{ flex: '0 0 35%' }} />

          {/* Info panel (~20%) — header, keywords, commitment stacked */}
          <div
            style={{
              flex: '0 0 18%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 12px',
              height: '80%',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text }}>
                2026
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', color: colors.border }}>
                만다라트 차트
              </div>
            </div>

            {/* Name & Keywords */}
            <div
              style={{
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '10px',
                border: `2px solid ${colors.gridBorder}`,
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '3px' }}>
                {mandala.name || '이름'}의 KEYWORD
              </div>
              <div style={{ fontSize: '9px', fontWeight: 600, lineHeight: '1.4', color: colors.text }}>
                {keywords.length > 0
                  ? keywords.join(', ')
                  : '키워드를 입력해주세요'}
              </div>
            </div>

            {/* Commitment */}
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                textAlign: 'center',
                backgroundColor: colors.subGoal,
                border: `2px solid ${colors.border}`,
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, lineHeight: '1.4' }}>
                {mandala.commitment || '2026년 다짐을 입력해주세요!'}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '7px', marginTop: '4px', color: colors.border }}>
              Created with 2026 만다라트 목표 설계
            </div>
          </div>

          {/* Mandala Grid (~45%) — square, height-constrained */}
          <div
            style={{
              flex: '0 0 45%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px 12px 8px',
              height: '100%',
            }}
          >
            <div
              style={{
                height: '92%',
                aspectRatio: '1',
                maxWidth: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: '2px',
                }}
              >
                {gridSections.map((section) => (
                  <div
                    key={section.key}
                    style={{
                      position: 'relative',
                      backgroundColor: 'white',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(3, 1fr)',
                      border: `2px solid ${colors.gridBorder}`,
                      borderRadius: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Section number */}
                    {!section.isCenter && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: '4px',
                          fontSize: '7px',
                          fontWeight: 600,
                          color: colors.border,
                          zIndex: 10,
                        }}
                      >
                        #{section.subGoalIndex + 1}
                      </div>
                    )}

                    {section.cells.map((cell) => (
                      <div
                        key={cell.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '1px',
                          overflow: 'hidden',
                          backgroundColor: cell.cellBg,
                          fontSize: `${Math.max(cell.fontSize * 0.7, 6)}px`,
                          fontWeight: cell.fontWeight,
                          border: `1px solid ${colors.gridBorder}`,
                          lineHeight: `${Math.ceil(cell.fontSize * 0.85)}px`,
                          wordBreak: 'break-all' as const,
                        }}
                      >
                        <span style={{ width: '100%' }}>
                          {cell.content}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Portrait layout (original A4) ───
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
            <div className="text-base font-extrabold mb-1">
              {mandala.name || '이름'}의 2026년 KEYWORD
            </div>
            <div className="text-sm font-bold leading-relaxed">
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
            <div className="text-base font-bold leading-snug">
              {mandala.commitment || '2026년 다짐을 입력해주세요!'}
            </div>
          </div>
        </div>

        {/* Mandala Grid */}
        {renderGrid()}

        {/* Footer */}
        <div className="text-center text-[10px] pt-1" style={{ color: colors.border }}>
          Created with 2026 만다라트 목표 설계
        </div>
      </div>
    </div>
  )
}
