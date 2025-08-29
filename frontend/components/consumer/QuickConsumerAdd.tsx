'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuickConsumerAddProps {
  onSuccess?: () => void
  className?: string
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
  'Other'
]

export default function QuickConsumerAdd({ onSuccess, className = '' }: QuickConsumerAddProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    consumer_id: '',
    connection_name: '',
    electricity_board: '',
    connection_type: 'domestic' as 'domestic' | 'commercial' | 'industrial'
  })

  const resetForm = () => {
    setFormData({
      consumer_id: '',
      connection_name: '',
      electricity_board: '',
      connection_type: 'domestic'
    })
  }

  const handleSave = async () => {
    if (!formData.consumer_id.trim()) {
      toast.error('Please enter Consumer ID')
      return
    }
    if (!formData.electricity_board) {
      toast.error('Please select Electricity Board')
      return
    }

    setSaving(true)
    try {
      const connectionData = {
        user_id: user?.id,
        consumer_id: formData.consumer_id.trim(),
        connection_name: formData.connection_name.trim() || 'New Connection',
        electricity_board: formData.electricity_board,
        connection_type: formData.connection_type,
        is_primary: false, // Additional connections are not primary by default
        is_active: true
      }

      const { error } = await supabase
        .from('consumer_connections')
        .insert(connectionData)

      if (error) throw error

      toast.success('Consumer connection added successfully!')
      resetForm()
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving connection:', error)
      toast.error('Failed to save consumer connection')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
      >
        <Plus className="h-4 w-4" />
        Add Consumer Connection
      </Button>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Add New Consumer Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Consumer ID / Number *</Label>
            <Input
              value={formData.consumer_id}
              onChange={(e) => setFormData(prev => ({ ...prev, consumer_id: e.target.value }))}
              placeholder="e.g., 123456789012"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Connection Name</Label>
            <Input
              value={formData.connection_name}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_name: e.target.value }))}
              placeholder="e.g., Home, Office, Shop"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Electricity Board *</Label>
            <Select
              value={formData.electricity_board}
              onValueChange={(value) => setFormData(prev => ({ ...prev, electricity_board: value }))}
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
              value={formData.connection_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, connection_type: value as typeof formData.connection_type }))}
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
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false)
              resetForm()
            }}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            {saving ? 'Adding...' : 'Add Connection'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Tip:</strong> Find your Consumer Number on your electricity bill - it&apos;s usually a 10-12 digit number 
            labeled as &quot;Consumer Number&quot;, &quot;Consumer ID&quot;, or &quot;Account Number&quot;.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
