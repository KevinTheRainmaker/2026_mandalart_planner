export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function Loading({ size = 'md', message, className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div role="status" className="flex items-center justify-center">
        <div
          className={`${sizeClasses[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin`}
        ></div>
      </div>
      {message && <p className="mt-3 text-gray-600 text-sm">{message}</p>}
    </div>
  )
}
