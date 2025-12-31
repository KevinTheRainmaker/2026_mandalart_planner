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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('만다라트 종합 리포트', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const today = new Date().toLocaleDateString('ko-KR')
    doc.text(`생성일: ${today}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Section 1: 회고 요약
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('1. 회고 요약', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const reflectionLines = doc.splitTextToSize(
      aiSummary.reflection_summary || '회고 요약이 없습니다.',
      contentWidth
    )
    doc.text(reflectionLines, margin, yPosition)
    yPosition += reflectionLines.length * 7 + 10

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Section 2: 목표 구조 분석
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('2. 목표 구조 분석', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const goalLines = doc.splitTextToSize(
      aiSummary.goal_analysis || '목표 분석이 없습니다.',
      contentWidth
    )
    doc.text(goalLines, margin, yPosition)
    yPosition += goalLines.length * 7 + 10

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Section 3: 핵심 키워드
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('3. 핵심 키워드', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const keywords = aiSummary.keywords || []
    if (keywords.length > 0) {
      const keywordText = keywords.map((kw, idx) => `${idx + 1}. ${kw}`).join('\n')
      const keywordLines = doc.splitTextToSize(keywordText, contentWidth)
      doc.text(keywordLines, margin, yPosition)
      yPosition += keywordLines.length * 7 + 10
    } else {
      doc.text('키워드가 없습니다.', margin, yPosition)
      yPosition += 17
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Section 4: 통합 인사이트
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('4. 통합 인사이트', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const insightLines = doc.splitTextToSize(
      aiSummary.insights || '인사이트가 없습니다.',
      contentWidth
    )
    doc.text(insightLines, margin, yPosition)

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating report PDF:', error)
    throw error
  }
}

/**
 * Generate PDF from Mandala grid element
 */
export async function generateMandalaPDF(
  element: HTMLElement | null,
  mandala: Mandala,
  filename: string = 'mandala-chart.pdf'
): Promise<boolean> {
  if (!element) {
    throw new Error('Element is required to generate Mandala PDF')
  }

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#f3f4f6',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Create PDF
    const doc = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Title
    let yPosition = margin
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('만다라트 9×9 계획서', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Center Goal
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`중심 목표: ${mandala.center_goal}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Calculate image dimensions to fit page
    const availableWidth = pageWidth - 2 * margin
    const availableHeight = pageHeight - yPosition - margin

    let finalWidth = availableWidth
    let finalHeight = (imgHeight * availableWidth) / imgWidth

    // If height is too large, scale by height instead
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight
      finalWidth = (imgWidth * availableHeight) / imgHeight
    }

    const xPosition = (pageWidth - finalWidth) / 2

    // Add image
    doc.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight)

    // Save PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Error generating Mandala PDF:', error)
    throw error
  }
}
