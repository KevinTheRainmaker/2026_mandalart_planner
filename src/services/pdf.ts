import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MandalaPreview } from '@/components/mandala/MandalaPreview'
import type { AISummary, Mandala } from '@/types'

// A4 dimensions in pixels (at 96 DPI)
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate designed Mandala PDF by capturing the React MandalaPreview component
 * This ensures the PDF output matches the preview exactly
 */
export async function generateMandalaPDF(
  _element: HTMLElement | null,
  mandala: Mandala,
  filename: string = "mandala-chart.pdf",
  colorTheme: 'pink' | 'blue' | 'green' | 'beige' = 'pink'
): Promise<boolean> {
  try {
    // Create hidden container with exact A4 dimensions
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = `${A4_WIDTH_PX}px`
    container.style.height = `${A4_HEIGHT_PX}px`
    container.style.backgroundColor = 'white'
    container.style.overflow = 'hidden'
    document.body.appendChild(container)

    // Create React root and render MandalaPreview
    const root = createRoot(container)
    
    await new Promise<void>((resolve) => {
      // Create wrapper element
      const wrapper = React.createElement('div', {
        style: { 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }
      }, React.createElement(MandalaPreview, { mandala, colorTheme }))
      
      root.render(wrapper)
      // Wait for render to complete
      setTimeout(resolve, 100)
    })

    // Wait a bit more for fonts to load
    await new Promise(resolve => setTimeout(resolve, 200))

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: null,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
    })

    // Clean up React root and container
    root.unmount()
    document.body.removeChild(container)

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)

    // Download PDF
    pdf.save(filename)
    return true

  } catch (error) {
    console.error('Failed to generate Mandala PDF:', error)
    return false
  }
}

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

    // Build HTML content with escaped AI-generated text
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
            ${escapeHtml(aiSummary.reflection_summary || '회고 요약이 없습니다.')}
          </p>
        </div>

        <!-- Section 2: 목표 구조 분석 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            2. 목표 구조 분석
          </h2>
          <p style="font-size: 13px; line-height: 1.8; color: #374151; white-space: pre-wrap;">
            ${escapeHtml(aiSummary.goal_analysis || '목표 분석이 없습니다.')}
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
                ${escapeHtml(kw)}
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
            ${escapeHtml(aiSummary.insights || '인사이트가 없습니다.')}
          </p>
        </div>
      </div>
    `

    // Append to body temporarily
    document.body.appendChild(container)

    // Generate canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Remove container
    document.body.removeChild(container)

    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add image to PDF (may need multiple pages)
    let heightLeft = imgHeight
    let position = 0
    const pageHeight = 297 // A4 height in mm

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    )
    heightLeft -= pageHeight

    // Add more pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= pageHeight
    }

    // Save PDF
    pdf.save(filename)
    return true

  } catch (error) {
    console.error('Failed to generate Report PDF:', error)
    return false
  }
}
