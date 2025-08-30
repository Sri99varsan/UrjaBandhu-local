'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout, proceeding without auth')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }).catch((error: any) => {
      if (mounted) {
        console.error('Error getting session:', error)
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!mounted) return
      
      console.log('Auth state change:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create or update user profile
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, creating/updating profile')
        await createOrUpdateProfile(session.user)
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state')
        setSession(null)
        setUser(null)
        setLoading(false)
      }
      
      // Handle token refresh
      if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed')
        setSession(session)
        setUser(session.user)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const createOrUpdateProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          notification_preferences: {
            email_alerts: true,
            push_notifications: true,
            energy_tips: true,
            weekly_reports: true
          },
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          energy_rate: 8.00,
          currency: 'INR',
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error creating/updating profile:', error)
        // Don't throw here, as auth should still work even if profile creation fails
      } else {
        console.log('Profile created/updated successfully for user:', user.id)
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error)
      // Don't throw here, as auth should still work even if profile creation fails
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    console.log('SignOut initiated...')
    try {
      setLoading(true)
      
      // Clear any local storage first
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Force clear auth state before calling signOut
      setSession(null)
      setUser(null)
      
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      })
      
      if (error) {
        console.error('SignOut error:', error)
        // Even if there's an error, still clear local state
        setSession(null)
        setUser(null)
        setLoading(false)
        // Don't throw - allow redirect to proceed
        return
      }
      
      console.log('SignOut successful')
      setLoading(false)
    } catch (error) {
      console.error('SignOut failed:', error)
      // Clear state even on error
      setSession(null)
      setUser(null)
      setLoading(false)
      // Don't throw - allow redirect to proceed
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
