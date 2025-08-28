'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Zap,
  Globe,
  Moon,
  Sun,
  Save,
  Trash2,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  notification_preferences: {
    email_alerts: boolean
    push_notifications: boolean
    energy_tips: boolean
    weekly_reports: boolean
  }
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  energy_rate: number
  currency: string
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // Check if it's a missing record error (PGRST116)
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, creating default profile for user:', user?.id)
        } else {
          console.error('Database error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
        }
        
        // Create default profile if doesn't exist or there's an error
        const defaultProfile: Partial<UserProfile> = {
          id: user?.id,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          notification_preferences: {
            email_alerts: true,
            push_notifications: true,
            energy_tips: true,
            weekly_reports: true
          },
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          energy_rate: 8, // Default ₹8 per kWh
          currency: 'INR'
        }
        setProfile(defaultProfile as UserProfile)
        
        // Try to create the profile in the database
        await createDefaultProfile(defaultProfile as UserProfile)
      } else {
        // If data exists but is missing fields, merge with defaults
        const completeProfile = {
          ...data,
          notification_preferences: data.notification_preferences || {
            email_alerts: true,
            push_notifications: true,
            energy_tips: true,
            weekly_reports: true
          },
          theme: data.theme || 'system',
          language: data.language || 'en',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          energy_rate: data.energy_rate || 8,
          currency: data.currency || 'INR'
        }
        setProfile(completeProfile)
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      toast.error('Failed to load profile settings')
      
      // Still provide a default profile so the page doesn't break
      const defaultProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || '',
        notification_preferences: {
          email_alerts: true,
          push_notifications: true,
          energy_tips: true,
          weekly_reports: true
        },
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        energy_rate: 8,
        currency: 'INR'
      }
      setProfile(defaultProfile)
    } finally {
      setLoadingData(false)
    }
  }

  const createDefaultProfile = async (profile: UserProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: user?.user_metadata?.avatar_url || null,
          notification_preferences: profile.notification_preferences,
          theme: profile.theme,
          language: profile.language,
          timezone: profile.timezone,
          energy_rate: profile.energy_rate,
          currency: profile.currency,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating default profile:', error)
        // If the table structure doesn't match, we'll just use the frontend state
        console.log('Using in-memory profile until database schema is updated')
      } else {
        console.log('Default profile created successfully')
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error)
    }
  }

  const saveProfile = async () => {
    if (!profile || !user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          notification_preferences: profile.notification_preferences,
          theme: profile.theme,
          language: profile.language,
          timezone: profile.timezone,
          energy_rate: profile.energy_rate,
          currency: profile.currency,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving profile:', error)
        toast.error('Failed to save settings')
      } else {
        toast.success('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const updateNotificationPreferences = (key: string, value: boolean) => {
    setProfile(prev => prev ? {
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    } : null)
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Failed to load profile</h2>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'energy', name: 'Energy Settings', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Sidebar */}
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <div className="bg-white shadow rounded-lg">
              <div className="py-6 px-4 sm:p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Profile Information</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => updateProfile({ full_name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed here</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {Object.entries(profile.notification_preferences).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {key === 'email_alerts' && 'Receive email notifications for important alerts'}
                              {key === 'push_notifications' && 'Receive push notifications on your device'}
                              {key === 'energy_tips' && 'Get energy saving tips and recommendations'}
                              {key === 'weekly_reports' && 'Receive weekly energy consumption reports'}
                            </p>
                          </div>
                          <button
                            onClick={() => updateNotificationPreferences(key, !value)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              value ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                value ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">App Preferences</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Theme</label>
                        <select
                          value={profile.theme}
                          onChange={(e) => updateProfile({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select
                          value={profile.language}
                          onChange={(e) => updateProfile({ language: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी (Hindi)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="te">తెలుగు (Telugu)</option>
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                          <option value="gu">ગુજરાતી (Gujarati)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                        <input
                          type="text"
                          value={profile.timezone}
                          onChange={(e) => updateProfile({ timezone: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Energy Settings Tab */}
                {activeTab === 'energy' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Energy Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Energy Rate (per kWh)</label>
                        <div className="mt-1 relative">
                          <input
                            type="number"
                            step="0.01"
                            value={profile.energy_rate}
                            onChange={(e) => updateProfile({ energy_rate: parseFloat(e.target.value) || 0 })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">This rate is used to calculate your energy costs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          value={profile.currency}
                          onChange={(e) => updateProfile({ currency: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
