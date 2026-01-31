export type ColorTheme = 'pink' | 'blue' | 'green' | 'beige'

export interface ColorPalette {
  name: string
  background: string
  centerGoal: string
  subGoal: string
  border: string
  text: string
  accent: string
}

export const COLOR_PALETTES: Record<ColorTheme, ColorPalette> = {
  pink: {
    name: '핑크',
    background: '#FFF8F6',
    centerGoal: '#FFDDD2',
    subGoal: '#FFE8E0',
    border: '#C9897B',
    text: '#6B4F4F',
    accent: '#E8A598',
  },
  blue: {
    name: '블루',
    background: '#F6F9FF',
    centerGoal: '#C5D8FF',
    subGoal: '#DBE6FF',
    border: '#7B97C9',
    text: '#4F5A6B',
    accent: '#98B4E8',
  },
  green: {
    name: '그린',
    background: '#F6FFF8',
    centerGoal: '#C5FFD2',
    subGoal: '#DBFFE4',
    border: '#7BC987',
    text: '#4F6B52',
    accent: '#98E8A5',
  },
  beige: {
    name: '베이지',
    background: '#F5EFE6',
    centerGoal: '#E7D2BC',
    subGoal: '#F3E8DA',
    border: '#8B7355',
    text: '#2D2D2D',
    accent: '#C4A77D',
  },
}

export const DEFAULT_THEME: ColorTheme = 'pink'
