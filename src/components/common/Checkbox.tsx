import { InputHTMLAttributes, forwardRef } from 'react'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
