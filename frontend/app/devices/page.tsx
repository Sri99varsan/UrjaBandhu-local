'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Camera,
  Zap,
  MapPin,
  Activity,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import DeviceDetectionModal from '@/components/device-detection/DeviceDetectionModal'

interface Device {
  id: string
  name: string
  device_type?: string
  power_rating: number
  current_consumption: number
  status: 'active' | 'inactive'
  location: string
  efficiency_score: number
  created_at: string
  updated_at: string
}

export default function DevicesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetectionModal, setShowDetectionModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    device_type: '',
    power_rating: '',
    location: '',
    status: 'active' as 'active' | 'inactive'
  })

  const fetchDevices = useCallback(async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching devices:', error)
        toast.error('Failed to load devices')
      } else {
        setDevices(data || [])
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setLoadingData(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchDevices()
    }
  }, [user, loading, router, fetchDevices])

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('devices')
        .insert({
          user_id: user?.id,
          name: formData.name,
          device_type: formData.device_type,
          power_rating: parseFloat(formData.power_rating),
          location: formData.location,
          status: formData.status,
          current_consumption: 0,
          efficiency_score: 75 // Default efficiency score
        })

      if (error) {
        console.error('Error adding device:', error)
        toast.error('Failed to add device')
      } else {
        toast.success('Device added successfully')
        setShowAddModal(false)
        setFormData({
          name: '',
          device_type: '',
          power_rating: '',
          location: '',
          status: 'active'
        })
        fetchDevices()
      }
    } catch (error) {
      console.error('Error adding device:', error)
      toast.error('Failed to add device')
    }
  }

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDevice) return

    try {
      const { error } = await supabase
        .from('devices')
        .update({
          name: formData.name,
          device_type: formData.device_type,
          power_rating: parseFloat(formData.power_rating),
          location: formData.location,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDevice.id)

      if (error) {
        console.error('Error updating device:', error)
        toast.error('Failed to update device')
      } else {
        toast.success('Device updated successfully')
        setEditingDevice(null)
        setFormData({
          name: '',
          device_type: '',
          power_rating: '',
          location: '',
          status: 'active'
        })
        fetchDevices()
      }
    } catch (error) {
      console.error('Error updating device:', error)
      toast.error('Failed to update device')
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId)

      if (error) {
        console.error('Error deleting device:', error)
        toast.error('Failed to delete device')
      } else {
        toast.success('Device deleted successfully')
        fetchDevices()
      }
    } catch (error) {
      console.error('Error deleting device:', error)
      toast.error('Failed to delete device')
    }
  }

  const toggleDeviceStatus = async (device: Device) => {
    const newStatus = device.status === 'active' ? 'inactive' : 'active'

    try {
      const { error } = await supabase
        .from('devices')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', device.id)

      if (error) {
        console.error('Error updating device status:', error)
        toast.error('Failed to update device status')
      } else {
        toast.success(`Device ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
        fetchDevices()
      }
    } catch (error) {
      console.error('Error updating device status:', error)
      toast.error('Failed to update device status')
    }
  }

  const openEditModal = (device: Device) => {
    setEditingDevice(device)
    setFormData({
      name: device.name,
      device_type: device.device_type || '',
      power_rating: device.power_rating.toString(),
      location: device.location,
      status: device.status
    })
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingDevice(null)
    setFormData({
      name: '',
      device_type: '',
      power_rating: '',
      location: '',
      status: 'active'
    })
  }

  const handleDeviceDetected = (detectedDevice: any) => {
    // Pre-fill the form with detected device information
    setFormData({
      name: detectedDevice.device_name,
      device_type: detectedDevice.device_type,
      power_rating: detectedDevice.power_rating.toString(),
      location: '',
      status: 'active'
    })
    setShowAddModal(true)
    toast.success(`Device detected: ${detectedDevice.device_name}`)
  }

  const getDeviceIcon = (type: string | undefined) => {
    if (!type) return ''
    
    switch (type.toLowerCase()) {
      case 'lighting':
        return ''
      case 'cooling':
      case 'air conditioner':
        return ''
      case 'heating':
        return ''
      case 'appliance':
        return ''
      case 'kitchen':
        return ''
      case 'entertainment':
        return ''
      default:
        return ''
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading devices...</span>
        </div>
      </div>
    )
  }

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Device Management</h1>
                <p className="mt-2 text-gray-300">
                  Monitor and manage your electrical devices
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowDetectionModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-green-500/30 rounded-md shadow-sm text-sm font-medium text-green-400 bg-white/5 backdrop-blur-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Detect Device
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </button>
              </div>
            </div>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getDeviceIcon(device.device_type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{device.device_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(device)}
                        className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                        title="Edit device"
                        aria-label="Edit device"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                        title="Delete device"
                        aria-label="Delete device"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <button
                        onClick={() => toggleDeviceStatus(device)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          device.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        {device.status}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Power Rating</span>
                      <span className="text-sm font-medium text-white">{device.power_rating}W</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current Usage</span>
                      <span className="text-sm font-medium text-white">{device.current_consumption}kW</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Location</span>
                      <span className="text-sm font-medium text-white">{device.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Efficiency</span>
                      <div className="flex items-center">
                        <ProgressBar
                          value={device.efficiency_score}
                          className={`w-16 bg-gray-700 rounded-full h-2 mr-2`}
                          barClassName={`h-2 rounded-full ${
                            device.efficiency_score >= 80
                              ? 'bg-green-500'
                              : device.efficiency_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm font-medium text-white">{device.efficiency_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {devices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-white">No devices found</h3>
              <p className="mt-1 text-sm text-gray-400">Get started by adding your first device or detecting one with AI.</p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setShowDetectionModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-green-500/30 rounded-md shadow-sm text-sm font-medium text-green-400 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Detect Device
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Device Modal */}
      {(showAddModal || editingDevice) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border border-white/10 w-96 shadow-lg rounded-2xl bg-white/5 backdrop-blur-md m-4">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </h3>
              <form onSubmit={editingDevice ? handleEditDevice : handleAddDevice}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Device Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-white/20 rounded-md px-3 py-2 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="e.g., Living Room AC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Device Type</label>
                    <select
                      required
                      value={formData.device_type}
                      onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                      className="mt-1 block w-full border border-white/20 rounded-md px-3 py-2 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      title="Select device type"
                      aria-label="Select device type"
                    >
                      <option value="" className="bg-gray-800">Select Type</option>
                      <option value="lighting" className="bg-gray-800">Lighting</option>
                      <option value="cooling" className="bg-gray-800">Cooling</option>
                      <option value="heating" className="bg-gray-800">Heating</option>
                      <option value="appliance" className="bg-gray-800">Appliance</option>
                      <option value="kitchen" className="bg-gray-800">Kitchen</option>
                      <option value="entertainment" className="bg-gray-800">Entertainment</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Power Rating (Watts)</label>
                    <input
                      type="number"
                      required
                      value={formData.power_rating}
                      onChange={(e) => setFormData({ ...formData, power_rating: e.target.value })}
                      className="mt-1 block w-full border border-white/20 rounded-md px-3 py-2 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="e.g., 1500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full border border-white/20 rounded-md px-3 py-2 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="e.g., Living Room"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="mt-1 block w-full border border-white/20 rounded-md px-3 py-2 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      title="Select device status"
                      aria-label="Select device status"
                    >
                      <option value="active" className="bg-gray-800">Active</option>
                      <option value="inactive" className="bg-gray-800">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    {editingDevice ? 'Update' : 'Add'} Device
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Device Detection Modal */}
      <DeviceDetectionModal
        isOpen={showDetectionModal}
        onClose={() => setShowDetectionModal(false)}
        onDeviceDetected={handleDeviceDetected}
      />
    </div>
  )
}
