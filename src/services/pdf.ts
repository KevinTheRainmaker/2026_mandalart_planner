import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { AISummary, Mandala } from '@/types'

/**
 * Generate PDF from AI summary report
 */
export async function generateReportPDF(
  aiSummary: AISummary,
  filename: string = 'mandala-report.pdf'
): Promise<boolean> {
  try {
    // Create temporary HTML element for rendering
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '210mm' // A4 width
    container.style.padding = '20mm'
    container.style.backgroundColor = 'white'
    container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", sans-serif'

    // Build HTML content
    container.innerHTML = `
      <div style="color: #1f2937;">
        <!-- Title -->
        <h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #111827;">
          만다라트 종합 리포트
        </h1>
        <p style="text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 30px;">
          생성일: ${new Date().toLocaleDateString('ko-KR')}
        </p>

        <!-- Section 1: 회고 요약 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            1. 회고 요약
          </h2>
          <p style="font-size: 13px; line-height: 1.8; color: #374151; white-space: pre-wrap;">
            ${aiSummary.reflection_summary || '회고 요약이 없습니다.'}
          </p>
        </div>

        <!-- Section 2: 목표 구조 분석 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            2. 목표 구조 분석
          </h2>
          <p style="font-size: 13px; line-height: 1.8; color: #374151; white-space: pre-wrap;">
            ${aiSummary.goal_analysis || '목표 분석이 없습니다.'}
          </p>
        </div>

        <!-- Section 3: 핵심 키워드 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            3. 핵심 키워드
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
            ${(aiSummary.keywords || []).map(kw => `
              <span style="background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                ${kw}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Section 4: 통합 인사이트 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            4. 통합 인사이트
          </h2>
          <p style="font-size: 13px; line-height: 1.8; color: #374151; white-space: pre-wrap;">
            ${aiSummary.insights || '인사이트가 없습니다.'}
          </p>
        </div>
      </div>
    `

    // Append to body temporarily
    document.body.appendChild(container)

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: container.offsetWidth,
      windowWidth: container.offsetWidth,
    })

    // Remove temporary element
    document.body.removeChild(container)

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Calculate image dimensions
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    // Add image to PDF (split into pages if needed)
    let heightLeft = imgHeight
    let position = 0

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      doc.addPage()
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating report PDF:', error)
    throw error
  }
}

/**
 * Generate designed Mandala PDF with Korean text support
 * Vertical A4 layout (210×297mm) with improved typography and color palette
 */
export async function generateMandalaPDF(
  _element: HTMLElement | null,
  mandala: Mandala,
  filename: string = "mandala-chart.pdf",
  colorTheme: 'pink' | 'blue' | 'green' | 'beige' = 'pink'
): Promise<boolean> {
  try {
    // Color palette definitions
    const palettes = {
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

    const colors = palettes[colorTheme]

    // Get mandala data
    const centerGoal = mandala.center_goal || "핵심 목표"
    const subGoals = mandala.sub_goals || []
    const actionPlans = mandala.action_plans || {}
    const keywords = mandala.ai_summary?.keywords || []

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

    // Create HTML template - Vertical A4 (210×297mm → ~794×1123px at 96dpi)
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "0"
    container.style.width = "794px"
    container.style.height = "1123px"
    container.style.backgroundColor = colors.background
    container.style.fontFamily =
      '"Nanum Gothic", "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif'
    container.style.padding = "30px"
    container.style.boxSizing = "border-box"
    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.gap = "12px"
    ;(container.style as any).webkitFontSmoothing = "antialiased"

    // Build grid HTML
    const cellSize = 85 // Each cell in px (increased from 75 for better readability)
    const sectionGap = 3

    let gridHTML = ""
    for (let sectionRow = 0; sectionRow < 3; sectionRow++) {
      for (let sectionCol = 0; sectionCol < 3; sectionCol++) {
        const sectionIndex = sectionRow * 3 + sectionCol
        const isCenter = sectionIndex === 4
        const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
        const subGoal = isCenter ? "" : subGoals[subGoalIndex] || ""
        const plans = isCenter ? [] : actionPlans[subGoalIndex.toString()] || []

        gridHTML += `
          <div style="
            background-color: white;
            border: 2px solid ${colors.gridBorder};
            border-radius: 8px;
            position: relative;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 0;
            width: ${cellSize * 3}px;
            height: ${cellSize * 3}px;
            box-sizing: border-box;
            overflow: hidden;
          ">
        `

        // Add section number
        if (!isCenter) {
          gridHTML += `
            <div style="
              position: absolute;
              top: 3px;
              left: 5px;
              font-size: 9px;
              color: ${colors.border};
              z-index: 10;
              line-height: 1;
              font-weight: 600;
            ">#${subGoalIndex + 1}</div>
          `
        }

        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            let cellContent = ""
            let fontSize = 9
            let cellBg = "white"
            let fontWeight = "500"
            
            // Determine background color
            if (isCenter && isCenterCell) {
              cellBg = colors.centerGoal
            } else if ((isCenter && !isCenterCell) || (!isCenter && isCenterCell)) {
              cellBg = colors.subGoal
            }

            // Determine content and styling
            if (isCenter && isCenterCell) {
              cellContent = centerGoal
              fontSize = getFontSize(centerGoal, 22)
              fontWeight = "800"
            } else if (isCenter && !isCenterCell) {
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || ""
              fontSize = getFontSize(cellContent, 18)
              fontWeight = "700"
            } else if (!isCenter && isCenterCell) {
              cellContent = subGoal
              fontSize = getFontSize(subGoal, 18)
              fontWeight = "700"
            } else if (!isCenter) {
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ""
              fontSize = getFontSize(cellContent, 16)
              fontWeight = "500"
            }

            const lineHeightPx = Math.ceil(fontSize * 1.15)

            gridHTML += `
              <div style="
                border: 1px solid ${colors.gridBorder};
                display: table-cell;
                vertical-align: middle;
                text-align: center;
                padding: 2px;
                background-color: ${cellBg};
                box-sizing: border-box;
                color: ${colors.text};
                width: ${cellSize}px;
                height: ${cellSize}px;
              ">
                <span style="
                  font-size: ${fontSize}px;
                  font-weight: ${fontWeight};
                  line-height: ${lineHeightPx}px;
                  word-break: keep-all;
                  overflow-wrap: break-word;
                ">${escapeHtml(cellContent)}</span>
              </div>
            `
          }
        }

        gridHTML += `</div>`
      }
    }

    // Build full HTML with vertical layout
    container.innerHTML = `
      <!-- Header Section -->
      <div style="text-align: center; padding-bottom: 10px;">
        <div style="font-size: 32px; font-weight: 800; color: ${colors.text}; margin-bottom: 8px;">
          2026
        </div>
        <div style="font-size: 26px; font-weight: 700; color: ${colors.border}; letter-spacing: 2px;">
          만다라트 차트
        </div>
      </div>

      <!-- Keywords & Commitment Section -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
        padding: 10px 15px;
        background-color: white;
        border: 2px solid ${colors.gridBorder};
        border-radius: 10px;
      ">
        <!-- Left: Name & Keywords -->
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: 800; color: ${colors.text}; margin-bottom: 8px;">
            ${escapeHtml(mandala.name || "이름")}의 2026년 KEYWORD
          </div>
          <div style="font-size: 15px; font-weight: 700; color: ${colors.text}; line-height: 1.6;">
            ${keywords.length > 0 
              ? escapeHtml(keywords.join(', '))
              : '키워드를 입력해주세요'}
          </div>
        </div>

        <!-- Right: Commitment -->
        <div style="
          flex: 1;
          padding: 12px 16px;
          background-color: ${colors.subGoal};
          border-radius: 20px;
          border: 2px solid ${colors.border};
          position: relative;
        ">
          <div style="font-size: 16px; font-weight: 700; color: ${colors.text}; line-height: 1.5; text-align: center;">
            ${escapeHtml(mandala.commitment || "2026년 다짐을 입력해주세요!")}
          </div>
        </div>
      </div>

      <!-- Mandala Grid -->
      <div style="
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, ${cellSize * 3}px);
        grid-template-rows: repeat(3, ${cellSize * 3}px);
        gap: ${sectionGap}px;
        justify-content: center;
        align-content: center;
      ">
        ${gridHTML}
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 10px; color: ${colors.border}; padding-top: 5px;">
        Created with 2026 만다라트 목표 설계
      </div>
    `

    // Append to body temporarily
    document.body.appendChild(container)

    // Wait for font loading
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    // Convert to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 3,
      backgroundColor: colors.background,
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
      useCORS: true,
    })

    // Remove temporary element
    document.body.removeChild(container)

    // Create PDF - Portrait A4
    const imgData = canvas.toDataURL("image/png")
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add image to fit page
    doc.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight)

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error("Error generating Mandala PDF:", error)
    throw error
  }
}

/**
 * Prevent HTML injection + 깨진 레이아웃 방지용
 * (사용자 입력이 들어가는 경우 필수)
 */
function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
