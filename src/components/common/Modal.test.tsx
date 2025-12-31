import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('should render modal when isOpen is true', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const overlay = screen.getByRole('dialog').parentElement
    fireEvent.click(overlay!)

    expect(handleClose).toHaveBeenCalled()
  })

  it('should not close when content is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const content = screen.getByText('Content')
    fireEvent.click(content)

    expect(handleClose).not.toHaveBeenCalled()
  })
})
