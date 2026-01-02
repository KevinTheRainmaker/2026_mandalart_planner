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
 */
export async function generateMandalaPDF(
  element: HTMLElement | null,
  mandala: Mandala,
  filename: string = 'mandala-chart.pdf'
): Promise<boolean> {
  try {
    // Get mandala data
    const centerGoal = mandala.center_goal || '핵심 목표'
    const subGoals = mandala.sub_goals || []
    const actionPlans = mandala.action_plans || {}
    const keywords = mandala.ai_summary?.keywords || []

    // Section colors (lighter tones)
    const sectionColors = [
      '#ADD8E6', // light blue
      '#90EE90', // light green
      '#FFFFE0', // light yellow
      '#FFC0CB', // pink
      '#DDA0DD', // plum
      '#B0E0E6', // powder blue
      '#FFB6C1', // light pink
      '#FFDAB9', // peach
      '#D8BFD8', // thistle
    ]

    // Create HTML template
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '297mm' // A4 landscape width
    container.style.height = '210mm' // A4 landscape height
    container.style.backgroundColor = '#F5EFE6'
    container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
    container.style.padding = '15px'
    container.style.boxSizing = 'border-box'
    container.style.display = 'flex'
    container.style.gap = '20px'

    // Build grid HTML
    let gridHTML = ''
    for (let sectionRow = 0; sectionRow < 3; sectionRow++) {
      for (let sectionCol = 0; sectionCol < 3; sectionCol++) {
        const sectionIndex = sectionRow * 3 + sectionCol
        const isCenter = sectionIndex === 4
        const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
        const subGoal = isCenter ? '' : (subGoals[subGoalIndex] || '세부 목표')
        const plans = isCenter ? [] : (actionPlans[subGoalIndex.toString()] || [])
        const bgColor = isCenter ? '#D4C5B0' : sectionColors[sectionIndex]

        gridHTML += `<div style="background-color: ${bgColor}; border: 2px solid #666; position: relative; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1px;">`

        // Add section number
        if (!isCenter) {
          gridHTML += `<div style="position: absolute; top: 3px; left: 3px; font-size: 9px; color: #666; z-index: 10;">#${subGoalIndex + 1}</div>`
        }

        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            let cellContent = ''
            let cellStyle = 'border: 1px solid #999; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; background-color: white; height: 60px; box-sizing: border-box;'

            if (isCenter && isCenterCell) {
              // Center of center section - show main goal
              cellContent = centerGoal
              cellStyle += 'font-weight: bold; font-size: 11px; background-color: #FFF8DC;'
            } else if (isCenter && !isCenterCell) {
              // Surrounding cells of center section - show 8 sub-goals
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || '세부 목표'
              cellStyle += 'font-weight: 600; font-size: 9px; background-color: #F0F8FF;'
            } else if (!isCenter && isCenterCell) {
              // Center of other sections - show sub-goal
              cellContent = subGoal
              cellStyle += 'font-weight: bold; font-size: 10px; background-color: #FFF8DC;'
            } else if (!isCenter) {
              // Surrounding cells of other sections - show action plans
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ''
              cellStyle += 'font-size: 9px;'
            }

            gridHTML += `<div style="${cellStyle}"><div style="word-break: keep-all; overflow-wrap: break-word; line-height: 1.3;">${cellContent}</div></div>`
          }
        }
        gridHTML += '</div>'
      }
    }

    // Build full HTML
    container.innerHTML = `
      <div style="flex: 0 0 220px; color: #2D2D2D;">
        <!-- Title Section -->
        <div style="margin-bottom: 25px;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 6px;">
            ${mandala.name}'의'
          </div>
          <div style="font-size: 17px; font-weight: bold;">2026 만다라트</div>
        </div>

        <!-- Keywords Section -->
        <div style="margin-bottom: 25px;">
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px;">keyword</div>
          <div style="font-size: 11px; line-height: 1.6; margin-bottom: 6px;">
            ${keywords.length > 0 ? keywords.slice(0, 3).join(', ') : '키워드 2~3개를 적어주세요!'}
          </div>
          <div style="border-bottom: 2px solid #2D2D2D; width: 180px;"></div>
        </div>

        <!-- Commitment Section -->
        <div>
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">다짐 한 마디!!</div>
          <div style="font-size: 12px; line-height: 1.6; margin-bottom: 8px; word-break: keep-all;">
            ${mandala.commitment}
          </div>
          <div style="border-bottom: 2px solid #2D2D2D; width: 180px;"></div>
        </div>
      </div>

      <!-- Mandala Grid -->
      <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 6px;">
        ${gridHTML}
      </div>
    `

    // Append to body temporarily
    document.body.appendChild(container)

    // Convert to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 3,
      backgroundColor: '#F5EFE6',
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
    })

    // Remove temporary element
    document.body.removeChild(container)

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add image to fit page
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating Mandala PDF:', error)
    throw error
  }
}
