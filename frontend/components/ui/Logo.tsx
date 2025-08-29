import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  width?: number
  height?: number
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
  xl: 40
}

export function Logo({ className, size = 'md', width, height }: LogoProps) {
  const defaultSize = sizeMap[size]
  const logoWidth = width || defaultSize
  const logoHeight = height || defaultSize
  
  return (
    <Image
      src="/logo.png"
      alt="UrjaBandhu Logo"
      width={logoWidth}
      height={logoHeight}
      className={cn("object-contain", className)}
      priority
    />
  )
}
