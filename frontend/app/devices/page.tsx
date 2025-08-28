'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  device_type: string
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchDevices()
    }
  }, [user, loading, router])

  const fetchDevices = async () => {
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
  }

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
      device_type: device.device_type,
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

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lighting':
        return '💡'
      case 'cooling':
      case 'air conditioner':
        return '❄️'
      case 'heating':
        return '🔥'
      case 'appliance':
        return '📺'
      case 'kitchen':
        return '🍳'
      default:
        return '⚡'
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
              <p className="mt-2 text-gray-600">
                Monitor and manage your electrical devices
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowDetectionModal(true)}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Camera className="h-4 w-4 mr-2" />
                Detect Device
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            <div key={device.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getDeviceIcon(device.device_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{device.device_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(device)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <button
                      onClick={() => toggleDeviceStatus(device)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        device.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      {device.status}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Power Rating</span>
                    <span className="text-sm font-medium text-gray-900">{device.power_rating}W</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Usage</span>
                    <span className="text-sm font-medium text-gray-900">{device.current_consumption} kW</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium text-gray-900">{device.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Efficiency</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            device.efficiency_score >= 80
                              ? 'bg-green-500'
                              : device.efficiency_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${device.efficiency_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{device.efficiency_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first device.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Device Modal */}
      {(showAddModal || editingDevice) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </h3>
              <form onSubmit={editingDevice ? handleEditDevice : handleAddDevice}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Living Room AC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Type</label>
                    <select
                      required
                      value={formData.device_type}
                      onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="lighting">Lighting</option>
                      <option value="cooling">Cooling</option>
                      <option value="heating">Heating</option>
                      <option value="appliance">Appliance</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Power Rating (Watts)</label>
                    <input
                      type="number"
                      required
                      value={formData.power_rating}
                      onChange={(e) => setFormData({ ...formData, power_rating: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 1500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Living Room"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
