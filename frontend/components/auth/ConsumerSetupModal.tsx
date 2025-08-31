'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface ConsumerConnection {
  consumer_id: string
  connection_name: string
  electricity_board: string
  address: string
  connection_type: 'domestic' | 'commercial' | 'industrial'
  sanctioned_load: number | null
  phase_type: 'single' | 'three'
  is_primary: boolean
}

interface ConsumerSetupModalProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
  userId: string
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
  'APERC (Andhra Pradesh Electricity Regulatory Commission)',
  'TSERC (Telangana State Electricity Regulatory Commission)',
  'OERC (Odisha Electricity Regulatory Commission)',
  'JERC (Joint Electricity Regulatory Commission)',
  'DERC (Delhi Electricity Regulatory Commission)',
  'RERC (Rajasthan Electricity Regulatory Commission)',
  'HERC (Haryana Electricity Regulatory Commission)',
  'HPERC (Himachal Pradesh Electricity Regulatory Commission)',
  'UPERC (Uttar Pradesh Electricity Regulatory Commission)',
  'BERC (Bihar Electricity Regulatory Commission)',
  'MPERC (Madhya Pradesh Electricity Regulatory Commission)',
  'CERC (Central Electricity Regulatory Commission)',
  'Other'
]

export default function ConsumerSetupModal({ isOpen, onComplete, onSkip, userId }: ConsumerSetupModalProps) {
  const [connections, setConnections] = useState<ConsumerConnection[]>([
    {
      consumer_id: '',
      connection_name: '',
      electricity_board: '',
      address: '',
      connection_type: 'domestic',
      sanctioned_load: null,
      phase_type: 'single',
      is_primary: true
    }
  ])
  const [saving, setSaving] = useState(false)

  const addConnection = () => {
    setConnections(prev => [
      ...prev,
      {
        consumer_id: '',
        connection_name: '',
        electricity_board: '',
        address: '',
        connection_type: 'domestic',
        sanctioned_load: null,
        phase_type: 'single',
        is_primary: false
      }
    ])
  }

  const removeConnection = (index: number) => {
    if (connections.length === 1) {
      toast.error('You must have at least one connection')
      return
    }
    
    setConnections(prev => {
      const newConnections = prev.filter((_, i) => i !== index)
      // If we removed the primary connection, make the first one primary
      if (prev[index].is_primary && newConnections.length > 0) {
        newConnections[0].is_primary = true
      }
      return newConnections
    })
  }

  const updateConnection = (index: number, field: keyof ConsumerConnection, value: any) => {
    setConnections(prev => prev.map((conn, i) => {
      if (i === index) {
        const updated = { ...conn, [field]: value }
        // If setting this as primary, unset others
        if (field === 'is_primary' && value === true) {
          return updated
        }
        return updated
      } else if (field === 'is_primary' && value === true) {
        // Unset primary for other connections
        return { ...conn, is_primary: false }
      }
      return conn
    }))
  }

  const validateConnections = () => {
    for (const conn of connections) {
      if (!conn.consumer_id.trim()) {
        toast.error('Please enter Consumer ID for all connections')
        return false
      }
      if (!conn.electricity_board) {
        toast.error('Please select Electricity Board for all connections')
        return false
      }
    }
    
    const hasPrimary = connections.some(conn => conn.is_primary)
    if (!hasPrimary && connections.length > 1) {
      // Set first connection as primary if none is set
      setConnections(prev => prev.map((conn, i) => ({ ...conn, is_primary: i === 0 })))
    }
    
    return true
  }

  const saveConnections = async () => {
    if (!validateConnections()) return
    
    setSaving(true)
    try {
      // For demo users, simulate the setup process without database save
      if (userId === 'demo-user') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.success(`Setup completed successfully! Welcome to UrjaBandhu!`)
        onComplete()
        return
      }

      // Prepare connections data for authenticated users
      const connectionsData = connections.map((conn, index) => ({
        user_id: userId,
        consumer_id: conn.consumer_id.trim(),
        connection_name: conn.connection_name.trim() || `Connection ${index + 1}`,
        electricity_board: conn.electricity_board,
        address: conn.address.trim(),
        connection_type: conn.connection_type,
        sanctioned_load: conn.sanctioned_load,
        phase_type: conn.phase_type,
        is_primary: connections.length === 1 ? true : conn.is_primary,
        is_active: true
      }))

      // Insert all connections
      const { error } = await supabase
        .from('consumer_connections')
        .insert(connectionsData)

      if (error) throw error

      toast.success(`Added ${connections.length} consumer connection${connections.length > 1 ? 's' : ''} successfully!`)
      onComplete()
    } catch (error) {
      console.error('Error saving connections:', error)
      toast.error('Failed to save consumer connections')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-md border border-white/20 text-white shadow-2xl"
                       style={{
                         background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(16,16,16,0.95) 50%, rgba(0,32,0,0.85) 100%)'
                       }}>
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Setup Your Electricity Connections
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                Add your Consumer Number(s) to start tracking your electricity usage and get personalized recommendations.
                Consumer Numbers are unique identifiers found on your electricity bill.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {connections.map((connection, index) => (
            <Card key={index} className="bg-white/5 border-white/10 relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Connection {index + 1}
                    {connection.is_primary && (
                      <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Primary
                      </span>
                    )}
                  </h3>
                  {connections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConnection(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Consumer ID / Number *</Label>
                    <Input
                      value={connection.consumer_id}
                      onChange={(e) => updateConnection(index, 'consumer_id', e.target.value)}
                      placeholder="e.g., 123456789012"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Connection Name</Label>
                    <Input
                      value={connection.connection_name}
                      onChange={(e) => updateConnection(index, 'connection_name', e.target.value)}
                      placeholder="e.g., Home, Office, Shop"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Electricity Board *</Label>
                    <Select
                      value={connection.electricity_board}
                      onValueChange={(value) => updateConnection(index, 'electricity_board', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your electricity board" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {electricityBoards.map((board) => (
                          <SelectItem key={board} value={board} className="text-white hover:bg-gray-700">
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Connection Type</Label>
                    <Select
                      value={connection.connection_type}
                      onValueChange={(value) => updateConnection(index, 'connection_type', value as ConsumerConnection['connection_type'])}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="domestic" className="text-white hover:bg-gray-700">Domestic</SelectItem>
                        <SelectItem value="commercial" className="text-white hover:bg-gray-700">Commercial</SelectItem>
                        <SelectItem value="industrial" className="text-white hover:bg-gray-700">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Address</Label>
                    <Input
                      value={connection.address}
                      onChange={(e) => updateConnection(index, 'address', e.target.value)}
                      placeholder="Connection address"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Sanctioned Load (kW)</Label>
                    <Input
                      type="number"
                      value={connection.sanctioned_load || ''}
                      onChange={(e) => updateConnection(index, 'sanctioned_load', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 5.0"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  {connections.length > 1 && (
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id={`primary-${index}`}
                        checked={connection.is_primary}
                        onChange={(e) => updateConnection(index, 'is_primary', e.target.checked)}
                        className="rounded"
                        aria-label="Make this primary connection"
                      />
                      <Label htmlFor={`primary-${index}`} className="text-white text-sm">
                        Make this primary connection
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addConnection}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Connection
          </Button>
        </div>

        <div className="flex justify-between pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-gray-400 hover:text-white"
          >
            Skip for now
          </Button>
          
          <Button
            onClick={saveConnections}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Where to find your Consumer Number:</strong> Check your electricity bill - it&apos;s usually a 10-12 digit number 
            labeled as &quot;Consumer Number&quot;, &quot;Consumer ID&quot;, &quot;Account Number&quot;, or &quot;Service Connection Number&quot;.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
