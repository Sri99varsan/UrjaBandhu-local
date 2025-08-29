'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/80">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-emerald-500">
              <Logo className="h-5 w-5" width={20} height={20} />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block text-white">UrjaBandhu</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-green-400 text-gray-300">
              Home
            </Link>
            <Link href="/features" className="transition-colors hover:text-green-400 text-gray-300">
              Features
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-green-400 text-gray-300">
              Pricing
            </Link>
            <Link href="/about" className="transition-colors hover:text-green-400 text-gray-300">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex text-gray-300 hover:text-green-400 hover:bg-white/5">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-semibold">
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="grid gap-2 p-4">
            <Link
              href="/"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
