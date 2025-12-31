import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayCard } from './DayCard'

describe('DayCard', () => {
  it('should render day number and title', () => {
    render(
      <DayCard
        day={1}
        title="회고 시작"
        status="completed"
        onClick={() => {}}
      />
    )

    expect(screen.getByText('Day 1')).toBeInTheDocument()
    expect(screen.getByText('회고 시작')).toBeInTheDocument()
  })

  it('should show completed status with checkmark', () => {
    render(
      <DayCard
        day={1}
        title="회고 시작"
        status="completed"
        onClick={() => {}}
      />
    )

    const card = screen.getByText('Day 1').closest('div[class*="border-2"]')
    expect(card).toHaveClass('border-primary-600')
  })

  it('should show current status with highlight', () => {
    render(
      <DayCard
        day={3}
        title="목표 설정"
        status="current"
        onClick={() => {}}
      />
    )

    const card = screen.getByText('Day 3').closest('div[class*="border-2"]')
    expect(card).toHaveClass('bg-primary-50')
  })

  it('should show locked status with disabled style', () => {
    render(
      <DayCard
        day={10}
        title="액션플랜"
        status="locked"
        onClick={() => {}}
      />
    )

    const card = screen.getByText('Day 10').closest('div[class*="border-2"]')
    expect(card).toHaveClass('opacity-50')
  })

  it('should call onClick when clicked and not locked', () => {
    const handleClick = vi.fn()

    render(
      <DayCard
        day={1}
        title="회고"
        status="completed"
        onClick={handleClick}
      />
    )

    const card = screen.getByText('Day 1').closest('div[class*="border-2"]')!
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledWith(1)
  })

  it('should not call onClick when locked', () => {
    const handleClick = vi.fn()

    render(
      <DayCard day={10} title="액션플랜" status="locked" onClick={handleClick} />
    )

    const card = screen.getByText('Day 10').closest('div[class*="border-2"]')!
    fireEvent.click(card)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
