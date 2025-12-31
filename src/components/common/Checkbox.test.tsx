import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
  })

  it('should call onChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Checkbox label="Accept" onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalled()
  })

  it('should be checked when checked prop is true', () => {
    render(<Checkbox label="Accept" checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox label="Accept" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
