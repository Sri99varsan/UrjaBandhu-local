'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
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
  Settings,
  Plus,
  Edit3,
  Building,
  Star,
  MapPin
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

interface ConsumerConnection {
  id?: string
  consumer_id: string
  connection_name: string
  electricity_board: string
  address: string
  connection_type: 'domestic' | 'commercial' | 'industrial'
  sanctioned_load: number | null
  phase_type: 'single' | 'three'
  is_primary: boolean
  is_active: boolean
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Consumer connections state
  const [connections, setConnections] = useState<ConsumerConnection[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConsumerConnection | null>(null)
  const [formData, setFormData] = useState<Partial<ConsumerConnection>>({
    consumer_id: '',
    connection_name: '',
    electricity_board: '',
    address: '',
    connection_type: 'domestic',
    sanctioned_load: null,
    phase_type: 'single',
    is_primary: false,
    is_active: true
  })

  const createDefaultProfile = useCallback(async (profile: UserProfile) => {
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
  }, [user])

  const fetchProfile = useCallback(async () => {
    try {
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
    }
  }, [user, createDefaultProfile])

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

  // Consumer connections functions
  const loadConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('consumer_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading connections:', error)
        // If table doesn't exist, just set empty connections
        setConnections([])
        return
      }
      setConnections(data || [])
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load consumer connections')
      // Set empty connections on error
      setConnections([])
    }
  }, [user])

  useEffect(() => {
    console.log('Settings page useEffect triggered:', { loading, user: !!user })
    
    if (!loading && !user) {
      console.log('No user found, redirecting to auth')
      router.push('/auth')
      return
    }

    if (user) {
      console.log('User found, loading settings data for user:', user.id)
      const loadData = async () => {
        try {
          setLoadingData(true)
          console.log('Starting to load profile and connections...')
          await Promise.all([
            fetchProfile(),
            loadConnections()
          ])
          console.log('Successfully loaded profile and connections')
        } catch (error) {
          console.error('Error loading settings data:', error)
        } finally {
          console.log('Setting loadingData to false')
          setLoadingData(false)
        }
      }
      
      loadData()
    }
  }, [user?.id, loading])

  const saveConnection = async () => {
    if (!formData.consumer_id || !formData.electricity_board) {
      toast.error('Please fill in Consumer ID and Electricity Board')
      return
    }

    setSaving(true)
    try {
      // If this is the first connection, make it primary
      const isPrimary = connections.length === 0 || formData.is_primary

      const connectionData = {
        ...formData,
        user_id: user?.id,
        is_primary: isPrimary,
        connection_name: formData.connection_name || `Connection ${connections.length + 1}`
      }

      let result
      if (editingConnection?.id) {
        // Update existing connection
        result = await supabase
          .from('consumer_connections')
          .update(connectionData)
          .eq('id', editingConnection.id)
          .select()
      } else {
        // Insert new connection
        result = await supabase
          .from('consumer_connections')
          .insert(connectionData)
          .select()
      }

      if (result.error) throw result.error

      toast.success(editingConnection ? 'Connection updated!' : 'Connection added!')
      setFormData({
        consumer_id: '',
        connection_name: '',
        electricity_board: '',
        address: '',
        connection_type: 'domestic',
        sanctioned_load: null,
        phase_type: 'single',
        is_primary: false,
        is_active: true
      })
      setShowAddForm(false)
      setEditingConnection(null)
      await loadConnections()
    } catch (error) {
      console.error('Error saving connection:', error)
      toast.error('Failed to save connection')
    } finally {
      setSaving(false)
    }
  }

  const deleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return

    try {
      const { error } = await supabase
        .from('consumer_connections')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Connection deleted')
      await loadConnections()
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('Failed to delete connection')
    }
  }

  const setPrimaryConnection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('consumer_connections')
        .update({ is_primary: true })
        .eq('id', id)

      if (error) throw error

      toast.success('Primary connection updated')
      await loadConnections()
    } catch (error) {
      console.error('Error setting primary connection:', error)
      toast.error('Failed to update primary connection')
    }
  }

  const startEditing = (connection: ConsumerConnection) => {
    setEditingConnection(connection)
    setFormData(connection)
    setShowAddForm(true)
  }

  console.log('Render check:', { loading, loadingData, profile: !!profile })
  
  if (loading || loadingData) {
    console.log('Showing loading spinner because:', { loading, loadingData })
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading settings...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    console.log('No profile found, showing error message')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Failed to load profile</h2>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold rounded-lg shadow-lg shadow-green-500/25 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'consumers', name: 'Consumer IDs', icon: Zap },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'energy', name: 'Energy Settings', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="mt-2 text-gray-300">
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
                      className={`group rounded-lg px-3 py-2 flex items-center text-sm font-medium w-full text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white/10 backdrop-blur-md border border-green-500/30 text-green-400'
                          : 'text-gray-300 hover:text-green-400 hover:bg-white/5 border border-transparent'
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
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                <div className="py-6 px-4 sm:p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-white mb-6">Profile Information</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-300">Full Name</label>
                          <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => updateProfile({ full_name: e.target.value })}
                            className="mt-1 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            aria-label="Full Name"
                            title="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">Email</label>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="mt-1 block w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                            aria-label="Email address"
                            title="Email address (cannot be changed)"
                          />
                          <p className="mt-1 text-xs text-gray-500">Email cannot be changed here</p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Consumer IDs Tab */}
                {activeTab === 'consumers' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white mb-6">Consumer Connections</h3>
                    
                    {/* Existing Connections */}
                    {connections.length > 0 && (
                      <div className="mb-6">
                        <div className="grid gap-4">
                          {connections.map((connection) => (
                            <div key={connection.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-green-500/30 transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-white font-medium flex items-center gap-2">
                                    <Building className="h-4 w-4 text-green-400" />
                                    {connection.connection_name}
                                    {connection.is_primary && (
                                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30 flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Primary
                                      </span>
                                    )}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEditing(connection)}
                                    className="text-gray-400 hover:text-green-400 p-1"
                                    title="Edit connection"
                                    aria-label="Edit connection"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  {!connection.is_primary && (
                                    <button
                                      onClick={() => setPrimaryConnection(connection.id!)}
                                      className="text-gray-400 hover:text-green-400 p-1"
                                      title="Set as primary connection"
                                      aria-label="Set as primary connection"
                                    >
                                      <Star className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteConnection(connection.id!)}
                                    className="text-gray-400 hover:text-red-400 p-1"
                                    title="Delete connection"
                                    aria-label="Delete connection"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-400">Consumer ID: </span>
                                  <span className="text-white font-mono">{connection.consumer_id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Type: </span>
                                  <span className="text-white capitalize">{connection.connection_type}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-400">Board: </span>
                                  <span className="text-white">{connection.electricity_board}</span>
                                </div>
                                {connection.address && (
                                  <div className="md:col-span-2">
                                    <span className="text-gray-400">Address: </span>
                                    <span className="text-white">{connection.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add/Edit Form */}
                    {showAddForm && (
                      <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-400" />
                          {editingConnection ? 'Edit Connection' : 'Add New Consumer Connection'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Consumer ID *</label>
                            <input
                              type="text"
                              value={formData.consumer_id}
                              onChange={(e) => setFormData(prev => ({ ...prev, consumer_id: e.target.value }))}
                              placeholder="Enter your Consumer ID"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Connection Name</label>
                            <input
                              type="text"
                              value={formData.connection_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, connection_name: e.target.value }))}
                              placeholder="e.g., Home, Office, Shop"
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Electricity Board *</label>
                            <select
                              value={formData.electricity_board}
                              onChange={(e) => setFormData(prev => ({ ...prev, electricity_board: e.target.value }))}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              title="Select electricity board"
                              aria-label="Select electricity board"
                            >
                              <option value="" className="bg-gray-800">Select Board</option>
                              <option value="MSEB (Maharashtra State Electricity Board)" className="bg-gray-800">MSEB (Maharashtra)</option>
                              <option value="KSEB (Kerala State Electricity Board)" className="bg-gray-800">KSEB (Kerala)</option>
                              <option value="TNEB (Tamil Nadu Electricity Board)" className="bg-gray-800">TNEB (Tamil Nadu)</option>
                              <option value="KPTCL (Karnataka Power Transmission Corporation Limited)" className="bg-gray-800">KPTCL (Karnataka)</option>
                              <option value="WBSEDCL (West Bengal State Electricity Distribution Company Limited)" className="bg-gray-800">WBSEDCL (West Bengal)</option>
                              <option value="Other" className="bg-gray-800">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Connection Type</label>
                            <select
                              value={formData.connection_type}
                              onChange={(e) => setFormData(prev => ({ ...prev, connection_type: e.target.value as any }))}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              title="Select connection type"
                              aria-label="Select connection type"
                            >
                              <option value="domestic" className="bg-gray-800">Domestic</option>
                              <option value="commercial" className="bg-gray-800">Commercial</option>
                              <option value="industrial" className="bg-gray-800">Industrial</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                            <textarea
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Enter the address for this connection"
                              rows={2}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={saveConnection}
                            disabled={saving}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : (editingConnection ? 'Update Connection' : 'Add Connection')}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(false)
                              setEditingConnection(null)
                              setFormData({
                                consumer_id: '',
                                connection_name: '',
                                electricity_board: '',
                                address: '',
                                connection_type: 'domestic',
                                sanctioned_load: null,
                                phase_type: 'single',
                                is_primary: false,
                                is_active: true
                              })
                            }}
                            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add Button */}
                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15 hover:border-white/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                        Add Consumer Connection
                      </button>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {Object.entries(profile.notification_preferences).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {key === 'email_alerts' && 'Receive email notifications for important alerts'}
                              {key === 'push_notifications' && 'Receive push notifications on your device'}
                              {key === 'energy_tips' && 'Get energy saving tips and recommendations'}
                              {key === 'weekly_reports' && 'Receive weekly energy consumption reports'}
                            </p>
                          </div>
                          <button
                            onClick={() => updateNotificationPreferences(key, !value)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black ${
                              value ? 'bg-green-600' : 'bg-white/20'
                            }`}
                            title={`Toggle ${key.replace(/_/g, ' ')} - currently ${value ? 'enabled' : 'disabled'}`}
                            aria-label={`Toggle ${key.replace(/_/g, ' ')} - currently ${value ? 'enabled' : 'disabled'}`}
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
                    <h3 className="text-lg leading-6 font-medium text-white mb-6">App Preferences</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Theme</label>
                        <select
                          value={profile.theme}
                          onChange={(e) => updateProfile({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                          className="mt-1 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          title="Select theme preference"
                          aria-label="Select theme preference"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Language</label>
                        <select
                          value={profile.language}
                          onChange={(e) => updateProfile({ language: e.target.value })}
                          className="mt-1 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          title="Select language preference"
                          aria-label="Select language preference"
                        >
                          <option value="en" className="bg-gray-800 text-white">English</option>
                          <option value="hi" className="bg-gray-800 text-white">हिंदी (Hindi)</option>
                          <option value="bn" className="bg-gray-800 text-white">বাংলা (Bengali)</option>
                          <option value="te" className="bg-gray-800 text-white">తెలుగు (Telugu)</option>
                          <option value="mr" className="bg-gray-800 text-white">मराठी (Marathi)</option>
                          <option value="ta" className="bg-gray-800 text-white">தமிழ் (Tamil)</option>
                          <option value="gu" className="bg-gray-800 text-white">ગુજરાતી (Gujarati)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Timezone</label>
                        <input
                          type="text"
                          value={profile.timezone}
                          onChange={(e) => updateProfile({ timezone: e.target.value })}
                          className="mt-1 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          title="Enter your timezone"
                          aria-label="Enter your timezone"
                          placeholder="e.g., Asia/Kolkata"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Energy Settings Tab */}
                {activeTab === 'energy' && (
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white mb-6">Energy Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Energy Rate (per kWh)</label>
                        <div className="mt-1 relative">
                          <input
                            type="number"
                            step="0.01"
                            value={profile.energy_rate}
                            onChange={(e) => updateProfile({ energy_rate: parseFloat(e.target.value) || 0 })}
                            className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            title="Enter energy rate per kWh"
                            aria-label="Enter energy rate per kWh"
                            placeholder="e.g., 8.50"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 sm:text-sm">₹</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">This rate is used to calculate your energy costs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Currency</label>
                        <select
                          value={profile.currency}
                          onChange={(e) => updateProfile({ currency: e.target.value })}
                          className="mt-1 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          title="Select currency preference"
                          aria-label="Select currency preference"
                        >
                          <option value="INR" className="bg-gray-800 text-white">Indian Rupee (₹)</option>
                          <option value="USD" className="bg-gray-800 text-white">US Dollar ($)</option>
                          <option value="EUR" className="bg-gray-800 text-white">Euro (€)</option>
                          <option value="GBP" className="bg-gray-800 text-white">British Pound (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-4 py-3 sm:px-6 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-medium rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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
