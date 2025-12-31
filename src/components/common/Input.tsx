import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showCharCount?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      showCharCount,
      className = '',
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'

    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300'

    const inputClasses = `${baseClasses} ${errorClasses} ${className}`

    const currentLength =
      typeof value === 'string' ? value.length : value?.toString().length || 0

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="text-sm text-gray-500 mt-1 text-right">
            {currentLength}/{maxLength}
          </div>
        )}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
