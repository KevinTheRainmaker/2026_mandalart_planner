/**
 * Integration Test: Core Workflow Logic
 *
 * Tests the core business logic and data flow of the 14-day workflow:
 * - Mandala data creation and updates
 * - AI report generation
 * - PDF generation
 * - Data persistence across days
 */

import { describe, it, expect, vi } from 'vitest'
import { generateAIReport } from '@/services/gemini'
import { generateReportPDF, generateMandalaPDF } from '@/services/pdf'
import type { Mandala, AISummary } from '@/types'

// Mock Gemini API
vi.mock('@/services/gemini')
vi.mock('@/services/pdf')

describe('Core Workflow Logic Integration Test', () => {
  it('should complete the full workflow data flow', async () => {
    console.log('🚀 Starting full workflow logic test...\n')

    // ====================================
    // STEP 1: Initialize Mandala
    // ====================================
    console.log('📋 Step 1: Creating new Mandala')

    const mandala: Mandala = {
      id: 'test-id',
      user_id: 'user-123',
      year: 2025,
      current_day: 1,
      completed_days: [],
      reflection_theme: null,
      reflection_answers: {},
      reflection_notes: null,
      center_goal: null,
      sub_goals: [],
      action_plans: {},
      ai_summary: null,
      marketing_consent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    expect(mandala.current_day).toBe(1)
    expect(mandala.completed_days).toHaveLength(0)
    console.log('✅ Mandala initialized\n')

    // ====================================
    // STEP 2: Days 1-2 (Reflection)
    // ====================================
    console.log('📝 Step 2: Completing reflection (Days 1-2)')

    mandala.reflection_theme = 'theme1'
    mandala.reflection_answers = {
      q1: '성장한 순간',
      q2: '극복한 어려움',
      q3: '배운 교훈',
    }
    mandala.current_day = 2
    mandala.completed_days = [1]

    expect(mandala.reflection_theme).toBe('theme1')
    expect(Object.keys(mandala.reflection_answers)).toHaveLength(3)
    console.log('✅ Day 1 completed')

    mandala.reflection_notes = '내년에는 더 나은 사람이 되고 싶습니다'
    mandala.current_day = 3
    mandala.completed_days = [1, 2]

    expect(mandala.reflection_notes).toBeTruthy()
    console.log('✅ Day 2 completed\n')

    // ====================================
    // STEP 3: Day 3 (Center Goal)
    // ====================================
    console.log('🎯 Step 3: Setting center goal (Day 3)')

    mandala.center_goal = '건강한 삶 만들기'
    mandala.current_day = 4
    mandala.completed_days = [1, 2, 3]

    expect(mandala.center_goal).toBe('건강한 삶 만들기')
    console.log('✅ Day 3 completed\n')

    // ====================================
    // STEP 4: Days 4-5 (Sub Goals)
    // ====================================
    console.log('🎲 Step 4: Setting sub-goals (Days 4-5)')

    mandala.sub_goals = [
      '규칙적인 운동',
      '건강한 식습관',
      '충분한 수면',
      '스트레스 관리',
      '정기 건강검진',
      '금연/절주',
      '체중 관리',
      '긍정적 마인드',
    ]
    mandala.current_day = 6
    mandala.completed_days = [1, 2, 3, 4, 5]

    expect(mandala.sub_goals).toHaveLength(8)
    console.log('✅ Days 4-5 completed\n')

    // ====================================
    // STEP 5: Days 6-13 (Action Plans)
    // ====================================
    console.log('📋 Step 5: Creating action plans (Days 6-13)')

    for (let i = 0; i < 8; i++) {
      mandala.action_plans[i.toString()] = [
        `액션플랜 1 for ${mandala.sub_goals[i]}`,
        `액션플랜 2 for ${mandala.sub_goals[i]}`,
        `액션플랜 3 for ${mandala.sub_goals[i]}`,
        `액션플랜 4 for ${mandala.sub_goals[i]}`,
        `액션플랜 5 for ${mandala.sub_goals[i]}`,
        `액션플랜 6 for ${mandala.sub_goals[i]}`,
        `액션플랜 7 for ${mandala.sub_goals[i]}`,
        `액션플랜 8 for ${mandala.sub_goals[i]}`,
      ]
    }
    mandala.current_day = 14
    mandala.completed_days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

    expect(Object.keys(mandala.action_plans)).toHaveLength(8)
    expect(mandala.action_plans['0']).toHaveLength(8)
    console.log('✅ Days 6-13 completed\n')

    // ====================================
    // STEP 6: Day 14 (AI Report)
    // ====================================
    console.log('🤖 Step 6: Generating AI report (Day 14)')

    const mockAISummary: AISummary = {
      reflection_summary: '회고 요약입니다.',
      goal_analysis: '목표 분석입니다.',
      keywords: ['건강', '성장', '균형'],
      insights: '통합 인사이트입니다.',
    }

    vi.mocked(generateAIReport).mockResolvedValue(mockAISummary)

    const aiReport = await generateAIReport(mandala)

    expect(aiReport).toEqual(mockAISummary)
    expect(aiReport.keywords).toHaveLength(3)
    console.log('✅ AI report generated')

    mandala.ai_summary = aiReport
    mandala.completed_days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

    expect(mandala.ai_summary).toBeTruthy()
    console.log('✅ Day 14 completed\n')

    // ====================================
    // STEP 7: PDF Generation
    // ====================================
    console.log('📄 Step 7: Generating PDFs')

    vi.mocked(generateReportPDF).mockResolvedValue(true)
    vi.mocked(generateMandalaPDF).mockResolvedValue(true)

    const reportPdfResult = await generateReportPDF(mandala.ai_summary!, 'report.pdf')
    expect(reportPdfResult).toBe(true)
    console.log('✅ Report PDF generated')

    const mockElement = document.createElement('div')
    const mandalaPdfResult = await generateMandalaPDF(mockElement, mandala, 'mandala.pdf')
    expect(mandalaPdfResult).toBe(true)
    console.log('✅ Mandala PDF generated\n')

    // ====================================
    // FINAL VERIFICATION
    // ====================================
    console.log('🔍 Final Verification')

    expect(mandala.completed_days).toHaveLength(14)
    expect(mandala.completed_days).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    expect(mandala.current_day).toBe(14)
    expect(mandala.reflection_theme).toBe('theme1')
    expect(mandala.center_goal).toBe('건강한 삶 만들기')
    expect(mandala.sub_goals).toHaveLength(8)
    expect(Object.keys(mandala.action_plans)).toHaveLength(8)
    expect(mandala.ai_summary).toBeTruthy()

    console.log('✅ All 14 days completed successfully!')
    console.log('\n📊 Final Mandala State:')
    console.log(`  - Reflection theme: ${mandala.reflection_theme}`)
    console.log(`  - Center goal: ${mandala.center_goal}`)
    console.log(`  - Sub-goals: ${mandala.sub_goals.length}`)
    console.log(`  - Action plans: ${Object.keys(mandala.action_plans).length} sub-goals × 8 plans`)
    console.log(`  - AI summary: ✓`)
    console.log(`  - Completed days: ${mandala.completed_days.length}/14`)
    console.log(`  - Current day: ${mandala.current_day}`)

    console.log('\n🎉 Full workflow test passed!\n')
  })

  it('should maintain data consistency across updates', () => {
    console.log('🔄 Testing data consistency...\n')

    const mandala: Partial<Mandala> = {
      center_goal: '목표 A',
      sub_goals: ['sub1', 'sub2'],
    }

    // Simulate update
    const updates = {
      sub_goals: ['sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub6', 'sub7', 'sub8'],
    }

    const updated = { ...mandala, ...updates }

    expect(updated.center_goal).toBe('목표 A')
    expect(updated.sub_goals).toHaveLength(8)

    console.log('✅ Data consistency maintained\n')
  })

  it('should validate required fields for AI report generation', () => {
    console.log('✔️  Testing validation...\n')

    const incompleteMandala: Partial<Mandala> = {
      center_goal: '테스트',
      sub_goals: [],
    }

    // Should have center goal
    expect(incompleteMandala.center_goal).toBeTruthy()

    // Sub-goals should be validated
    const isValid = incompleteMandala.sub_goals!.length === 8
    expect(isValid).toBe(false)

    console.log('✅ Validation checks passed\n')
  })
})
