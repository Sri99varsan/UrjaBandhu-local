'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Building, 
  Check,
  AlertCircle,
  ArrowRight,
  Edit3,
  Star
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

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

const electricityBoards = [
  'MSEB (Maharashtra State Electricity Board)',
  'KSEB (Kerala State Electricity Board)',
  'TNEB (Tamil Nadu Electricity Board)',
  'KPTCL (Karnataka Power Transmission Corporation Limited)',
  'WBSEDCL (West Bengal State Electricity Distribution Company Limited)',
  'UPPCL (Uttar Pradesh Power Corporation Limited)',
  'BSEB (Bihar State Electricity Board)',
  'PSEB (Punjab State Electricity Board)',
  'HSEB (Haryana State Electricity Board)',
  'RSEB (Rajasthan State Electricity Board)',
  'GSEB (Gujarat State Electricity Board)',
  'MPEB (Madhya Pradesh Electricity Board)',
  'APSEB (Andhra Pradesh State Electricity Board)',
  'TSEB (Telangana State Electricity Board)',
  'JSEB (Jharkhand State Electricity Board)',
  'CSEB (Chhattisgarh State Electricity Board)',
  'OSEB (Odisha State Electricity Board)',
  'ASEB (Assam State Electricity Board)',
  'Other'
]

export default function ConsumerSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [connections, setConnections] = useState<ConsumerConnection[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConsumerConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
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

  useEffect(() => {
    if (user) {
      loadConnections()
    }
  }, [user])

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('consumer_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load consumer connections')
    } finally {
      setLoading(false)
    }
  }

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

  const skipSetup = () => {
    router.push('/dashboard')
  }

  const continueToApp = () => {
    if (connections.length === 0) {
      toast.error('Please add at least one consumer connection or skip setup')
      return
    }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          className="px-6 py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <Logo className="h-8 w-8" width={32} height={32} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Set Up Your{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Consumer Connections
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Add your electricity meter Consumer IDs to start tracking your energy consumption and get personalized insights.
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Existing Connections */}
            {connections.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Your Consumer Connections</h2>
                <div className="grid gap-4">
                  {connections.map((connection, index) => (
                    <Card key={connection.id} className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-green-500/30 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-white flex items-center gap-2">
                              <Building className="h-5 w-5 text-green-400" />
                              {connection.connection_name}
                              {connection.is_primary && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(connection)}
                              className="text-gray-400 hover:text-green-400"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            {!connection.is_primary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrimaryConnection(connection.id!)}
                                className="text-gray-400 hover:text-green-400"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteConnection(connection.id!)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Consumer ID: </span>
                            <span className="text-white font-mono">{connection.consumer_id}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Connection Type: </span>
                            <span className="text-white capitalize">{connection.connection_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Board: </span>
                            <span className="text-white">{connection.electricity_board}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Phase: </span>
                            <span className="text-white capitalize">{connection.phase_type} Phase</span>
                          </div>
                          {connection.address && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Address: </span>
                              <span className="text-white">{connection.address}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add Connection Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <Card className="bg-white/5 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-green-400" />
                      {editingConnection ? 'Edit Connection' : 'Add New Consumer Connection'}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Enter your electricity meter details to track consumption
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="consumer_id" className="text-white">Consumer ID *</Label>
                        <Input
                          id="consumer_id"
                          value={formData.consumer_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, consumer_id: e.target.value }))}
                          placeholder="Enter your Consumer ID"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="connection_name" className="text-white">Connection Name</Label>
                        <Input
                          id="connection_name"
                          value={formData.connection_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, connection_name: e.target.value }))}
                          placeholder="e.g., Home, Office, Shop"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="electricity_board" className="text-white">Electricity Board *</Label>
                        <Select value={formData.electricity_board} onValueChange={(value) => setFormData(prev => ({ ...prev, electricity_board: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select your electricity board" />
                          </SelectTrigger>
                          <SelectContent>
                            {electricityBoards.map((board) => (
                              <SelectItem key={board} value={board}>{board}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="connection_type" className="text-white">Connection Type</Label>
                        <Select value={formData.connection_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, connection_type: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="domestic">Domestic</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phase_type" className="text-white">Phase Type</Label>
                        <Select value={formData.phase_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, phase_type: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Phase</SelectItem>
                            <SelectItem value="three">Three Phase</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sanctioned_load" className="text-white">Sanctioned Load (kW)</Label>
                        <Input
                          id="sanctioned_load"
                          type="number"
                          step="0.01"
                          value={formData.sanctioned_load || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sanctioned_load: e.target.value ? parseFloat(e.target.value) : null }))}
                          placeholder="e.g., 5.0"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter the address for this connection"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[80px]"
                      />
                    </div>

                    {connections.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_primary"
                          checked={formData.is_primary}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
                        />
                        <Label htmlFor="is_primary" className="text-white">Set as primary connection</Label>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={saveConnection}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold"
                      >
                        {saving ? 'Saving...' : (editingConnection ? 'Update Connection' : 'Add Connection')}
                      </Button>
                      <Button
                        variant="outline"
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
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Consumer Connection
                </Button>
              </motion.div>
            )}

            {/* Footer Actions */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>You can manage these connections later in <button onClick={() => router.push('/settings')} className="text-green-400 hover:text-green-300 underline">Settings</button></span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={skipSetup}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={continueToApp}
                  disabled={connections.length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold"
                >
                  Continue to App
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
