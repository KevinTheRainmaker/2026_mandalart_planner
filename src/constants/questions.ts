/**
 * Day별 안내 질문 및 메시지
 */

export const DAY_PROMPTS = {
  1: {
    title: '2025년 회고',
    description: '지난 한 해를 돌아보며 감정과 경험을 정리해보세요.',
    question: '아래 테마 중 하나를 선택하고 질문에 답변해주세요.',
  },
  2: {
    title: '회고 재검토',
    description: '어제 작성한 회고를 다시 보며 생각을 정리해보세요.',
    question: '회고 내용을 다시 보며 든 생각을 자유롭게 작성해주세요.',
  },
  3: {
    title: '2026년 최종 목표',
    description: '회고를 바탕으로 올해 이루고 싶은 목표를 설정해보세요.',
    question: '2026년, 당신이 이루고 싶은 가장 중요한 것은 무엇인가요?',
  },
  4: {
    title: '하위 목표 설정 (1/2)',
    description: '중심 목표를 이루기 위한 세부 영역을 정해보세요.',
    question: (centerGoal: string) =>
      `"${centerGoal}"를 이루기 위해 필요한 영역 4가지를 정해주세요.`,
  },
  5: {
    title: '하위 목표 설정 (2/2)',
    description: '중심 목표를 이루기 위한 세부 영역을 정해보세요.',
    question: (centerGoal: string) =>
      `"${centerGoal}"를 이루기 위해 필요한 영역 4가지를 추가로 정해주세요.`,
  },
  6: {
    title: '액션플랜 작성 (1/8)',
    description: '첫 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  7: {
    title: '액션플랜 작성 (2/8)',
    description: '두 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  8: {
    title: '액션플랜 작성 (3/8)',
    description: '세 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  9: {
    title: '액션플랜 작성 (4/8)',
    description: '네 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  10: {
    title: '액션플랜 작성 (5/8)',
    description: '다섯 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  11: {
    title: '액션플랜 작성 (6/8)',
    description: '여섯 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  12: {
    title: '액션플랜 작성 (7/8)',
    description: '일곱 번째 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  13: {
    title: '액션플랜 작성 (8/8)',
    description: '마지막 하위 목표의 구체적인 실행 계획을 세워보세요.',
    question: (subGoal: string) =>
      `"${subGoal}"을 달성하기 위한 구체적인 행동 8가지를 작성해주세요.`,
  },
  14: {
    title: '종합 리포트',
    description: '14일간의 여정을 마무리하고 종합 리포트를 받아보세요.',
    question: 'AI가 당신의 여정을 분석하여 종합 리포트를 생성합니다.',
  },
} as const

export const CENTER_GOAL_MAX_LENGTH = 100
export const SUB_GOAL_MAX_LENGTH = 50
export const ACTION_PLAN_MAX_LENGTH = 50
export const REFLECTION_ANSWER_MAX_LENGTH = 1000

export const TOTAL_DAYS = 14
export const TOTAL_SUB_GOALS = 8
export const TOTAL_ACTION_PLANS_PER_GOAL = 8
