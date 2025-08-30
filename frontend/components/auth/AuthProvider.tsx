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
      
      // Clear, detailed logging for debugging
      console.log('🔄 Auth Event:', event)
      console.log('👤 User Email:', session?.user?.email || 'No user')
      console.log('🎫 Session ID:', session?.access_token ? 'Present' : 'None')
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create or update user profile for sign in events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, creating/updating profile')
        try {
          await createOrUpdateProfile(session.user)
          console.log('✅ Profile setup completed successfully')
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError)
          // For OAuth users, we should still allow them to continue
          // but log the error for debugging
          if (session.user.app_metadata?.provider === 'google') {
            console.warn('⚠️ OAuth user profile creation failed, but allowing auth to continue')
          }
        }
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
        console.log('Token refreshed for user:', session.user?.email)
        setSession(session)
        setUser(session.user)
      }

      // Handle initial session load
      if (event === 'INITIAL_SESSION' && session) {
        console.log('Initial session loaded for user:', session.user?.email)
        setSession(session)
        setUser(session.user)
        setLoading(false)
      }
    })

    // Listen for custom auth refresh events
    const handleAuthRefresh = async () => {
      console.log('Auth refresh requested')
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        setUser(session.user)
        setLoading(false)
      }
    }

    window.addEventListener('auth-session-refresh', handleAuthRefresh)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
      window.removeEventListener('auth-session-refresh', handleAuthRefresh)
    }
  }, [])

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('Creating/updating profile for user:', user.id, user.email)
      
      // First, check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError)
      }

      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
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
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error creating/updating profile:', error)
        // Try a direct insert for new users
        if (error.code === 'PGRST204' || !existingProfile) {
          console.log('Attempting direct profile insert...')
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)
          
          if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
            console.error('Error inserting profile:', insertError)
            throw insertError
          } else if (!insertError) {
            console.log('Profile inserted successfully via direct insert')
          }
        } else {
          throw error
        }
      } else {
        console.log('Profile created/updated successfully for user:', user.id)
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error)
      // For critical OAuth flow, we should handle this more gracefully
      // but still allow auth to continue for existing users
      throw error
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
    // Detect environment
    const isProduction = process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
    
    // Use current origin for redirect URL
    let redirectUrl: string
    
    if (typeof window !== 'undefined') {
      redirectUrl = window.location.origin
    } else if (isProduction) {
      // Fallback to production URLs
      redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://urjabandhu.vercel.app'
    } else {
      redirectUrl = 'http://localhost:3000'
    }
    
    console.log('OAuth Environment:', isProduction ? 'Production' : 'Development')
    console.log('OAuth redirect URL:', `${redirectUrl}/auth/callback`)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        console.error('OAuth initiation error:', error)
        throw new Error(`OAuth initialization failed: ${error.message}`)
      }
      
      console.log('OAuth initiated successfully')
    } catch (error) {
      console.error('SignInWithGoogle failed:', error)
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
