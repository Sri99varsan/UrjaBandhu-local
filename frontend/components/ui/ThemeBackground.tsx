'use client'

import { cn } from '@/lib/utils'

interface ThemeBackgroundProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle' | 'intense'
}

export function ThemeBackground({ 
  children, 
  className,
  variant = 'default'
}: ThemeBackgroundProps) {
  const gridSizes = {
    default: 'bg-[size:40px_40px]',
    subtle: 'bg-[size:50px_50px]',
    intense: 'bg-[size:30px_30px]'
  }

  const gridOpacities = {
    default: 'bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)]',
    subtle: 'bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)]',
    intense: 'bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)]'
  }

  const orb1Classes = {
    default: 'w-64 h-64 bg-green-500/10 blur-[80px]',
    subtle: 'w-96 h-96 bg-green-500/8 blur-[100px]',
    intense: 'w-72 h-72 bg-green-500/15 blur-[90px]'
  }

  const orb2Classes = {
    default: 'w-48 h-48 bg-emerald-400/10 blur-[60px]',
    subtle: 'w-80 h-80 bg-emerald-400/8 blur-[80px]',
    intense: 'w-60 h-60 bg-emerald-400/12 blur-[70px]'
  }

  return (
    <div className={cn("min-h-screen bg-black relative overflow-hidden", className)}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className={cn("absolute inset-0", gridOpacities[variant], gridSizes[variant])} />
        <div className={cn("absolute top-20 left-20 rounded-full animate-pulse", orb1Classes[variant])} />
        <div className={cn("absolute bottom-20 right-20 rounded-full animate-pulse [animation-delay:2s]", orb2Classes[variant])} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export function ThemeCard({ 
  children, 
  className,
  hover = true 
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={cn(
      "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl",
      hover && "hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10",
      className
    )}>
      {children}
    </div>
  )
}
