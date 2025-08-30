'use client'

import { createContext, useContext } from 'react'

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  app_metadata?: {
    provider?: string
  }
}

interface AuthContextType {
  user: User | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user - since we're bypassing auth, create a fake user
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@urjabandhu.com',
    user_metadata: {
      full_name: 'UrjaBandhu User',
      avatar_url: ''
    },
    app_metadata: {
      provider: 'urjabandhu'
    }
  }

  const value = {
    user: mockUser,
    session: { user: mockUser },
    loading: false,
    signIn: async () => {
      // No-op since we're bypassing auth
    },
    signUp: async () => {
      // No-op since we're bypassing auth  
    },
    signOut: async () => {
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    },
    signInWithGoogle: async () => {
      // No-op since we're bypassing auth
    },
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