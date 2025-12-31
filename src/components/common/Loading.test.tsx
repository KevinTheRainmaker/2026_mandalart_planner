import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading', () => {
  it('should render loading spinner', () => {
    render(<Loading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<Loading message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('should apply custom size', () => {
    render(<Loading size="lg" />)
    const spinner = screen.getByRole('status').firstChild
    expect(spinner).toHaveClass('w-12', 'h-12')
  })
})
