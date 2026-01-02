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
 * Fixes: font loading timing, fractional borders, baseline clipping
 */
export async function generateMandalaPDF(
  element: HTMLElement | null,
  mandala: Mandala,
  filename: string = "mandala-chart.pdf"
): Promise<boolean> {
  try {
    // Get mandala data
    const centerGoal = mandala.center_goal || "핵심 목표"
    const subGoals = mandala.sub_goals || []
    const actionPlans = mandala.action_plans || {}
    const keywords = mandala.ai_summary?.keywords || []
    const BEIGE_LIGHT = "#F3E8DA" // 연한 베이지 (하위 목표용)
    const BEIGE_DARK  = "#E7D2BC" // 조금 더 진한 베이지 (핵심 목표용)
    
    // Helper function to determine font size based on text length (더 공격적으로)
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

    // Create HTML template (캡처 안정성을 위해 px 고정 권장)
    // 96dpi 기준 A4 landscape 근사값: 1122 x 794
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "0"
    container.style.width = "1022px"
    container.style.height = "754px"
    container.style.backgroundColor = "#F5EFE6"
    container.style.fontFamily =
      'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
    container.style.padding = "15px"
    container.style.boxSizing = "border-box"
    container.style.display = "flex"
    container.style.gap = "20px"
    // 폰트 렌더링/안정성 보조 (브라우저별 영향 다름)
    ;(container.style as any).webkitFontSmoothing = "antialiased"
    ;(container.style as any).textRendering = "geometricPrecision"

    // Build grid HTML
    let gridHTML = ""
    for (let sectionRow = 0; sectionRow < 3; sectionRow++) {
      for (let sectionCol = 0; sectionCol < 3; sectionCol++) {
        const sectionIndex = sectionRow * 3 + sectionCol
        const isCenter = sectionIndex === 4
        const subGoalIndex = sectionIndex > 4 ? sectionIndex - 1 : sectionIndex
        const subGoal = isCenter ? "" : subGoals[subGoalIndex] || "세부 목표"
        const plans = isCenter ? [] : actionPlans[subGoalIndex.toString()] || []

        // 각 섹션의 외곽선은 굵게, 크기는 고정 (220px)
        gridHTML += `
          <div style="
            background-color: white;
            border: 3px solid #333;
            position: relative;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 0;
            width: 220px;
            height: 220px;
            box-sizing: border-box;
          ">
        `

        // Add section number
        if (!isCenter) {
          gridHTML += `
            <div style="
              position: absolute;
              top: 2px;
              left: 2px;
              font-size: 8px;
              color: #666;
              z-index: 10;
              line-height: 1;
            ">#${subGoalIndex + 1}</div>
          `
        }

        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const cellIndex = cellRow * 3 + cellCol
            const isCenterCell = cellIndex === 4

            let cellContent = ""
            let fontSize = 8
            let cellBg = "white"
            if (isCenter && isCenterCell) {
              cellBg = BEIGE_DARK
            } else if (
              (isCenter && !isCenterCell) || 
              (!isCenter && isCenterCell)    
            ) {
              cellBg = BEIGE_LIGHT
            }

            let cellStyle = `
            border: 1px solid #ddd;
            display: grid;
            place-items: center;
            text-align: center;
            - padding: 6px 6px;
            + padding: 7px 6px 5px 6px;  /* top right bottom left */
            background-color: ${cellBg};
            box-sizing: border-box;
            - overflow: hidden;
            + overflow: visible;
            `
          
            if (isCenter && isCenterCell) {
              cellContent = centerGoal
              fontSize = getFontSize(centerGoal, 11)
              cellStyle += `font-weight: 700; font-size: ${fontSize}px;`
            } else if (isCenter && !isCenterCell) {
              const subGoalIdx = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = subGoals[subGoalIdx] || "세부 목표"
              fontSize = getFontSize(cellContent, 9)
              cellStyle += `font-weight: 600; font-size: ${fontSize}px;`
            } else if (!isCenter && isCenterCell) {
              cellContent = subGoal
              fontSize = getFontSize(subGoal, 10)
              cellStyle += `font-weight: 700; font-size: ${fontSize}px;`
            } else if (!isCenter) {
              const planIndex = cellIndex < 4 ? cellIndex : cellIndex - 1
              cellContent = plans[planIndex] || ""
              fontSize = getFontSize(cellContent, 8)
              cellStyle += `font-weight: 500; font-size: ${fontSize}px;`
            }
            

            const clampLines = 3
            const lineHeightPx = Math.ceil(fontSize * 1.45)  // 정수 px로 고정
            const maxHeightPx = clampLines * lineHeightPx + 6 // 하단 안전버퍼(6px)
            
            
            gridHTML += `
            <div style="${cellStyle}">
              <div style="
                width: 100%;
                box-sizing: border-box;
                word-break: keep-all;
                overflow-wrap: break-word;
                text-align: center;
          
                line-height: ${lineHeightPx}px;    /* ✅ px 정수 */
                max-height: ${maxHeightPx}px;      /* ✅ px 정수 */
                padding: 0 0 6px 0;                /* ✅ 하단 버퍼(px) */
                overflow: hidden;
              ">${escapeHtml(cellContent)}</div>
            </div>
          `
          
          }
        }

        gridHTML += `</div>`
      }
    }

    // Build full HTML
    container.innerHTML = `
      <div style="flex: 0 0 220px; color: #2D2D2D;">
        <!-- Title Section -->
        <div style="margin-bottom: 25px;">
          <div style="font-size: 20px; font-weight: 800; margin-bottom: 6px;">
            ${escapeHtml(mandala.name || "")}의
          </div>
          <div style="font-size: 17px; font-weight: 800;">2026 만다라트</div>
        </div>

        <!-- Keywords Section -->
        <div style="margin-bottom: 25px;">
          <div style="font-size: 15px; font-weight: 800; margin-bottom: 6px;">keyword</div>
          <div style="font-size: 11px; line-height: 1.6; margin-bottom: 6px;">
            ${
              keywords.length > 0
                ? escapeHtml(keywords.slice(0, 4).join(", "))
                : "키워드 3~5개를 적어주세요!"
            }
          </div>
          <div style="border-bottom: 2px solid #2D2D2D; width: 180px;"></div>
        </div>

        <!-- Commitment Section -->
        <div>
          <div style="font-size: 16px; font-weight: 800; margin-bottom: 8px;">다짐 한 마디!!</div>
          <div style="font-size: 12px; line-height: 1.6; margin-bottom: 8px; word-break: keep-all;">
            ${escapeHtml(mandala.commitment || "")}
          </div>
          <div style="border-bottom: 2px solid #2D2D2D; width: 180px;"></div>
        </div>
      </div>

      <!-- Mandala Grid -->
      <div style="
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 220px);
        grid-template-rows: repeat(3, 220px);
        gap: 6px;
        justify-content: center;
        align-content: start;
      ">
        ${gridHTML}
      </div>
    `

    // Append to body temporarily
    document.body.appendChild(container)

    // FIX 0) 캡처 전에 폰트 로딩 완료를 기다리기 (매우 중요)
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready
    }
    // 일부 환경에서 렌더 트리 안정화용 한 프레임 대기
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    // Convert to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 3,
      backgroundColor: "#F5EFE6",
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
      useCORS: true,
    })

    // Remove temporary element
    document.body.removeChild(container)

    // Create PDF
    const imgData = canvas.toDataURL("image/png")
    const doc = new jsPDF({
      orientation: "landscape",
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
