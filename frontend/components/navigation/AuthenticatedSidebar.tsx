'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  Home,
  Zap, 
  BarChart3, 
  Settings, 
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  Database,
  Bot,
  User,
  ChevronRight,
  Activity
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'AI Assistant', href: '/ai-chatbot', icon: Bot, badge: 'Chat' },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Real-Time Monitor', href: '/real-time-monitoring', icon: Activity, badge: 'Live' },
  { name: 'Devices', href: '/devices', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Advanced Analytics', href: '/analytics-advanced', icon: BarChart3, badge: 'Pro' },
  { name: 'AI Insights', href: '/ai-insights', icon: Bot, badge: 'AI' },
  { name: 'Time Series', href: '/time-series', icon: Database, badge: 'Live' },
  { name: 'Automation', href: '/automation', icon: Users, badge: 'New' },
  { name: 'Test Database', href: '/test-database', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function AuthenticatedSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    console.log('AuthenticatedSidebar: handleSignOut called')
    setIsSigningOut(true)
    try {
      // Show loading state
      setIsMobileMenuOpen(false)
      
      await signOut()
      console.log('AuthenticatedSidebar: signOut completed, redirecting to /signout')
      
      // Force a hard redirect to signout page
      setTimeout(() => {
        window.location.href = '/signout'
      }, 100)
      
    } catch (error) {
      console.error('AuthenticatedSidebar: signOut error:', error)
      // Even if sign out fails, redirect anyway for security
      setTimeout(() => {
        window.location.href = '/signout'
      }, 100)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Glassmorphism background with grid pattern */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-emerald-400/10 rounded-full blur-[30px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative flex grow flex-col gap-y-5 overflow-y-auto sidebar-scroll bg-black/90 backdrop-blur-md border-r border-white/10 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/25">
                <Logo className="h-5 w-5" width={20} height={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">UrjaBandhu</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-x-4 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user?.email} />
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold">
                {getInitials(user?.email || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <Separator className="border-white/10" />

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 border border-transparent",
                        isActive
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 shadow-lg shadow-green-500/10"
                          : "text-gray-300 hover:text-green-400 hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-green-400" : "text-gray-400 group-hover:text-green-400"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <Separator className="border-white/10" />

          {/* Bottom Actions */}
          <div className="mt-auto">
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="ghost"
              className="w-full justify-start gap-x-3 text-gray-300 hover:text-green-400 hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
            >
              {isSigningOut ? (
                <>
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-4 shadow-lg sm:px-6 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
          className="-m-2.5 text-gray-300 hover:text-green-400 lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-green-400 to-emerald-500">
              <Logo className="h-4 w-4" width={16} height={16} />
            </div>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">UrjaBandhu</span>
          </div>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={user?.email} />
          <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-500 text-black text-xs">
            {getInitials(user?.email || '')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="-m-2.5 text-green-400 hover:text-green-300"
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile sidebar content */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto sidebar-scroll bg-black/95 backdrop-blur-md border-r border-white/10 px-6 pb-4">
                {/* Mobile Logo */}
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/25">
                      <Logo className="h-5 w-5" width={20} height={20} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">UrjaBandhu</span>
                  </Link>
                </div>

                {/* Mobile User Profile */}
                <div className="flex items-center gap-x-4 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.email} />
                    <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold">
                      {getInitials(user?.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Separator className="border-white/10" />

                {/* Mobile Navigation */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 border border-transparent",
                              isActive
                                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 shadow-lg shadow-green-500/10"
                                : "text-gray-300 hover:text-green-400 hover:bg-white/5 hover:border-white/10"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                isActive ? "text-green-400" : "text-gray-400 group-hover:text-green-400"
                              )}
                            />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>

                <Separator className="border-white/10" />

                {/* Mobile Bottom Actions */}
                <div className="mt-auto">
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    variant="ghost"
                    className="w-full justify-start gap-x-3 text-gray-300 hover:text-green-400 hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <>
                        <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
