import { ReflectionThemeKey } from '@/types'

export interface ReflectionTheme {
  id: ReflectionThemeKey
  title: string
  questions: string[]
}

export const REFLECTION_THEMES: Record<ReflectionThemeKey, ReflectionTheme> = {
  theme1: {
    id: 'theme1',
    title: '다시 하고 싶은 마음을 되찾고 싶다면',
    questions: [
      '지난 해 가장 열정을 느꼈던 순간은 언제였나요?',
      '유용하지 않아도 괜찮다면, 어떻게 휴식하거나 재미를 느낄 것 같나요?',
      '매일 3시간의 자유시간이 주어진다면, 무엇을 하고 싶나요?',
    ],
  },
  theme2: {
    id: 'theme2',
    title: '번아웃이 올 듯 말 듯 바빴던 1년이라면',
    questions: [
      '나를 위해 가장 먼저 줄이고 싶은 일은 무엇인가요?',
      '지난 1년 가장 피로감이 심했던 순간은 언제였나요?',
      '내 삶에서 없어도 괜찮았던 일은 무엇인가요?',
      '힘든 와중에 지켜낸 것들은 무엇이었나요?',
    ],
  },
  theme3: {
    id: 'theme3',
    title: '자꾸만 미루고 계획에 실패했다면',
    questions: [
      '지난 1년 끝내지 못한 가장 중요한 일은 무엇인가요?',
      '반복되는 실패와 좌절의 순간은 언제였나요?',
      '지난 6개월간 내가 실제로 할 수 있는 일은 얼마였나요?',
      '올해 해야 할 딱 한 가지의 일만 남긴다면, 무엇인가요?',
    ],
  },
  theme4: {
    id: 'theme4',
    title: '인간관계에 변화가 많았다면',
    questions: [
      '관계에서 나를 가장 힘들게 한 일은 무엇이었나요?',
      '지난 1년 새롭게 생긴 소중한 인연은 누구인가요? 어떤 영향을 받았나요?',
      '나를 가장 잘 이해해 준 사람은 누구였나요?',
      '올해 어떤 사람과 더 많이 시간을 보내고 싶나요?',
    ],
  },
  theme5: {
    id: 'theme5',
    title: '행복했던 순간을 기억하고 싶다면',
    questions: [
      '지난 1년 새롭게 시도해보거나 경험해 본 일은 무엇인가요?',
      '예상하지 못했지만 기쁨을 줬던 일이 있나요?',
      '올해에도 다시 경험해 보고 싶은 순간이 있나요?',
      '나 자신을 위해 한 일 중 가장 기억에 남는 것은 무엇인가요?',
    ],
  },
  theme6: {
    id: 'theme6',
    title: '나에게 엄격한 완벽주의자였다면',
    questions: [
      '완벽하지 않았지만 그럼에도 만족스러웠던 순간은 언제였나요?',
      '자신을 있는 그대로 받아들이기 위해 필요한 것은 무엇인가요?',
      '올해는 삶의 어떤 부분에서 더 유연해지고 싶나요?',
      '지난 1년 애쓴 나에게, 너그러운 친구가 격려해 준다면 어떤 말을 건낼 것 같나요?',
    ],
  },
}

export const THEME_KEYS: ReflectionThemeKey[] = [
  'theme1',
  'theme2',
  'theme3',
  'theme4',
  'theme5',
  'theme6',
]
