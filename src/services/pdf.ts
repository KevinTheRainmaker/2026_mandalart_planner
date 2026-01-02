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
 * Helper function to wrap text to fit within a specified width
 */
function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = doc.getTextDimensions(testLine)

    if (metrics.w > maxWidth && i > 0) {
      doc.text(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  doc.text(line.trim(), x, currentY)
  return currentY + lineHeight
}

/**
 * Generate designed Mandala PDF (not screenshot-based)
 */
export async function generateMandalaPDF(
  element: HTMLElement | null,
  mandala: Mandala,
  filename: string = 'mandala-chart.pdf'
): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Colors
    const bgColor = '#F5EFE6' // Beige background
    const centerBgColor = '#D4C5B0' // Darker beige for center section
    const textColor = '#2D2D2D'

    // Draw beige background
    doc.setFillColor(245, 239, 230)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // === LEFT PANEL ===
    const leftPanelWidth = 80
    const leftMargin = 10
    let currentY = 20

    // Title section
    doc.setFontSize(10)
    doc.setTextColor(45, 45, 45)
    doc.text('이름 적는 곳', leftMargin, currentY)
    currentY += 8

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const nameText = mandala.name || '의'
    doc.text(nameText, leftMargin, currentY)
    currentY += 8

    doc.setFontSize(14)
    doc.text('2024 만다라트', leftMargin, currentY)
    currentY += 15

    // Keyword section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('keyword', leftMargin, currentY)
    currentY += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const keywords = mandala.ai_summary?.keywords || []
    if (keywords.length > 0) {
      const keywordsText = keywords.slice(0, 3).join(', ')
      currentY = wrapText(doc, keywordsText, leftMargin, currentY, leftPanelWidth - 20, 5)
    } else {
      doc.text('키워드 2~3개를 적어주세요!', leftMargin, currentY)
      currentY += 5
    }

    // Draw underline
    doc.setDrawColor(45, 45, 45)
    doc.line(leftMargin, currentY, leftMargin + 60, currentY)
    currentY += 15

    // Commitment section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('다짐 한 마디!!', leftMargin, currentY)
    currentY += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (mandala.commitment) {
      currentY = wrapText(doc, mandala.commitment, leftMargin, currentY, leftPanelWidth - 20, 5)
    } else {
      doc.text('2024년의 나님 한 말마로', leftMargin, currentY)
      currentY += 5
      doc.text('적어주세요!', leftMargin, currentY)
      currentY += 5
    }

    // Draw underline
    doc.line(leftMargin, currentY, leftMargin + 60, currentY)

    // === MANDALA GRID ===
    const gridStartX = leftPanelWidth + 20
    const gridStartY = 20
    const gridSize = 160 // Total grid size
    const sectionSize = gridSize / 3 // Each 3x3 section
    const cellSize = sectionSize / 3 // Each cell in a section

    // Get mandala data
    const centerGoal = mandala.center_goal || '핵심 목표'
    const subGoals = mandala.sub_goals || []
    const actionPlans = mandala.action_plans || {}

    // Section colors (lighter tones)
    const sectionColors = [
      [173, 216, 230], // light blue
      [144, 238, 144], // light green
      [255, 255, 224], // light yellow
      [255, 192, 203], // pink
      [221, 160, 221], // plum
      [176, 224, 230], // powder blue
      [255, 182, 193], // light pink
      [255, 218, 185], // peach
      [216, 191, 216], // thistle
    ]

    // Draw 9x9 grid
    for (let sectionRow = 0; sectionRow < 3; sectionRow++) {
      for (let sectionCol = 0; sectionCol < 3; sectionCol++) {
        const sectionIndex = sectionRow * 3 + sectionCol
        const sectionX = gridStartX + sectionCol * sectionSize
        const sectionY = gridStartY + sectionRow * sectionSize

        // Determine if this is the center section
        const isCenter = sectionIndex === 4

        // Set section background color
        if (isCenter) {
          doc.setFillColor(212, 197, 176) // Darker beige for center
        } else {
          const color = sectionColors[sectionIndex]
          doc.setFillColor(color[0], color[1], color[2])
        }

        // Draw section background
        doc.rect(sectionX, sectionY, sectionSize, sectionSize, 'F')

        // Draw section border
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(0.5)
        doc.rect(sectionX, sectionY, sectionSize, sectionSize, 'S')

        // Draw cells within section
        const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
        const subGoal = isCenter ? '' : (subGoals[subGoalIndex] || `세부 목표`)
        const plans = isCenter ? [] : (actionPlans[subGoalIndex.toString()] || [])

        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellX = sectionX + cellCol * cellSize
            const cellY = sectionY + cellRow * cellSize
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            // Draw cell border
            doc.setDrawColor(150, 150, 150)
            doc.setLineWidth(0.2)
            doc.rect(cellX, cellY, cellSize, cellSize, 'S')

            // Add text
            doc.setFontSize(7)
            doc.setTextColor(45, 45, 45)

            if (isCenter && isCenterCell) {
              // Center of center section - main goal
              doc.setFont('helvetica', 'bold')
              doc.setFontSize(8)
              const lines = doc.splitTextToSize(centerGoal, cellSize - 2)
              const textY = cellY + cellSize / 2 - (lines.length * 2.5) + 3
              doc.text(lines, cellX + cellSize / 2, textY, { align: 'center' })
            } else if (!isCenter && isCenterCell) {
              // Center of outer sections - sub goal
              doc.setFont('helvetica', 'bold')
              const lines = doc.splitTextToSize(subGoal, cellSize - 2)
              const textY = cellY + cellSize / 2 - (lines.length * 2.5) + 3
              doc.text(lines, cellX + cellSize / 2, textY, { align: 'center' })
            } else if (!isCenter) {
              // Outer cells - action plans
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              const plan = plans[planIndex] || ''
              if (plan) {
                doc.setFont('helvetica', 'normal')
                const lines = doc.splitTextToSize(plan, cellSize - 2)
                const textY = cellY + cellSize / 2 - (lines.length * 2.5) + 3
                doc.text(lines, cellX + cellSize / 2, textY, { align: 'center' })
              }
            }
          }
        }

        // Add section number label for non-center sections
        if (!isCenter) {
          doc.setFontSize(6)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.text(`#${subGoalIndex + 1}`, sectionX + 2, sectionY + 4)
        }
      }
    }

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating Mandala PDF:', error)
    throw error
  }
}
