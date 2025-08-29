import React, { useMemo } from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = "h-2 bg-gray-200 rounded-full overflow-hidden",
  barClassName = "h-full bg-blue-500 rounded-full transition-all duration-300"
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  // Generate dynamic width class using Tailwind arbitrary values
  const widthClass = useMemo(() => {
    return `w-[${percentage}%]`
  }, [percentage])
  
  return (
    <div className={className}>
      <div className={`${barClassName} ${widthClass}`} />
    </div>
  )
}
