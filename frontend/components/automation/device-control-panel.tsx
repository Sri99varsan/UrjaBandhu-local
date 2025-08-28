'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Power, 
  Settings, 
  Zap, 
  Gauge, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Plus
} from 'lucide-react'
import { automationService, DeviceControl } from '@/lib/automation-service'
import { format, formatDistanceToNow } from 'date-fns'

interface DeviceControlPanelProps {
  userId: string
}

interface ExtendedDeviceControl extends DeviceControl {
  device_name?: string
  device_type?: string
  location?: string
  temperature?: number
  efficiency?: number
  estimated_savings?: number
}

export function DeviceControlPanel({ userId }: DeviceControlPanelProps) {
  const [deviceControls, setDeviceControls] = useState<ExtendedDeviceControl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeviceControls()
  }, [userId])

  const loadDeviceControls = async () => {
    try {
      setLoading(true)
      const controls = await automationService.getDeviceControls()
      
      // Enhance with demo data
      const enhancedControls: ExtendedDeviceControl[] = controls.map((control, index) => ({
        ...control,
        device_name: getDemoDeviceName(control.device_id),
        device_type: getDemoDeviceType(control.device_id),
        location: getDemoLocation(index),
        temperature: getDemoTemperature(control.device_id),
        efficiency: Math.round(Math.random() * 30 + 70), // 70-100%
        estimated_savings: Math.round(Math.random() * 50 + 10) // ₹10-60
      }))

      setDeviceControls(enhancedControls)
    } catch (error) {
      console.error('Error loading device controls:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDemoDeviceName = (deviceId: string): string => {
    const names = {
      'demo-device-1': 'Smart Water Heater',
      'demo-device-2': 'Central Air Conditioner',
      'demo-device-3': 'Washing Machine',
      'demo-device-4': 'Electric Vehicle Charger'
    }
    return names[deviceId as keyof typeof names] || `Device ${deviceId.slice(-1)}`
  }

  const getDemoDeviceType = (deviceId: string): string => {
    const types = {
      'demo-device-1': 'Water Heater',
      'demo-device-2': 'HVAC',
      'demo-device-3': 'Appliance',
      'demo-device-4': 'EV Charger'
    }
    return types[deviceId as keyof typeof types] || 'Smart Device'
  }

  const getDemoLocation = (index: number): string => {
    const locations = ['Kitchen', 'Living Room', 'Garage', 'Basement']
    return locations[index % locations.length]
  }

  const getDemoTemperature = (deviceId: string): number | undefined => {
    if (deviceId === 'demo-device-1') return 65 // Water heater temp
    if (deviceId === 'demo-device-2') return 22 // AC temp
    return undefined
  }

  const toggleDevice = async (deviceId: string, currentState: string) => {
    try {
      const newState = currentState === 'on' ? 'off' : 'on'
      await automationService.updateDeviceControl(deviceId, {
        current_state: newState,
        last_command_at: new Date().toISOString(),
        last_command_status: 'success'
      })
      
      // Execute the action through automation service
      await automationService.executeDeviceAction(
        deviceId,
        {
          type: 'device_control',
          parameters: { action: newState === 'on' ? 'turn_on' : 'turn_off' }
        },
        userId
      )
      
      await loadDeviceControls()
    } catch (error) {
      console.error('Error toggling device:', error)
    }
  }

  const updatePowerLevel = async (deviceId: string, powerLevel: number) => {
    try {
      await automationService.updateDeviceControl(deviceId, {
        current_power_level: powerLevel,
        last_command_at: new Date().toISOString(),
        last_command_status: 'success'
      })
      
      // Execute the action through automation service
      await automationService.executeDeviceAction(
        deviceId,
        {
          type: 'device_control',
          parameters: { action: 'set_power', value: powerLevel }
        },
        userId
      )
      
      await loadDeviceControls()
    } catch (error) {
      console.error('Error updating power level:', error)
    }
  }

  const getStatusIcon = (state: string, lastCommand?: string) => {
    if (lastCommand === 'error') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    
    switch (state) {
      case 'on':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'off':
        return <Power className="h-4 w-4 text-gray-500" />
      case 'standby':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />
    }
  }

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'on':
        return 'bg-green-500'
      case 'off':
        return 'bg-gray-500'
      case 'standby':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Power className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Online Devices</p>
                <p className="text-2xl font-bold">
                  {deviceControls.filter(d => d.current_state === 'on').length}/{deviceControls.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Consumption</p>
                <p className="text-2xl font-bold">
                  {deviceControls.reduce((sum, d) => sum + d.current_consumption, 0).toFixed(1)}kW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Efficiency</p>
                <p className="text-2xl font-bold">
                  {Math.round(deviceControls.reduce((sum, d) => sum + (d.efficiency || 85), 0) / deviceControls.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Est. Savings</p>
                <p className="text-2xl font-bold">
                  ₹{deviceControls.reduce((sum, d) => sum + (d.estimated_savings || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deviceControls.map((device) => (
          <Card key={device.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{device.device_name}</span>
                    <div className={`w-2 h-2 rounded-full ${getStateColor(device.current_state)}`} />
                    <Badge variant="outline" className="capitalize">
                      {device.current_state}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <span>{device.device_type}</span>
                    <span>•</span>
                    <span>{device.location}</span>
                    {device.temperature && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Thermometer className="h-3 w-3" />
                          <span>{device.temperature}°C</span>
                        </span>
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(device.current_state, device.last_command_status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Device Controls */}
              <div className="space-y-3">
                {/* Power Toggle */}
                {device.can_turn_on_off && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Power className="h-4 w-4" />
                      <span className="font-medium">Power</span>
                    </div>
                    <Switch
                      checked={device.current_state === 'on'}
                      onCheckedChange={() => toggleDevice(device.device_id, device.current_state)}
                    />
                  </div>
                )}

                {/* Power Level */}
                {device.can_set_power_level && device.current_state === 'on' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Gauge className="h-4 w-4" />
                        <span className="font-medium">Power Level</span>
                      </div>
                      <span className="text-sm font-medium">{device.current_power_level || 0}%</span>
                    </div>
                    <Slider
                      value={[device.current_power_level || 0]}
                      onValueChange={([value]: number[]) => updatePowerLevel(device.device_id, value)}
                      max={device.max_power_level}
                      min={device.min_power_level}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Consumption Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Current Usage</span>
                    </div>
                    <span className="text-sm font-medium">{device.current_consumption.toFixed(1)}kW</span>
                  </div>
                  <Progress 
                    value={(device.current_consumption / 5) * 100} 
                    className="w-full h-2" 
                  />
                </div>

                {/* Efficiency */}
                {device.efficiency && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Efficiency</span>
                      </div>
                      <span className="text-sm font-medium">{device.efficiency}%</span>
                    </div>
                    <Progress 
                      value={device.efficiency} 
                      className="w-full h-2" 
                    />
                  </div>
                )}
              </div>

              {/* Device Info */}
              <div className="pt-3 border-t space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span>{formatDistanceToNow(new Date(device.last_updated_at), { addSuffix: true })}</span>
                </div>
                {device.last_command_at && (
                  <div className="flex items-center justify-between">
                    <span>Last Command:</span>
                    <span>{formatDistanceToNow(new Date(device.last_command_at), { addSuffix: true })}</span>
                  </div>
                )}
                {device.estimated_savings && (
                  <div className="flex items-center justify-between">
                    <span>Est. Daily Savings:</span>
                    <span className="font-medium text-green-600">₹{device.estimated_savings}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={!device.can_schedule}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deviceControls.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground mb-4">
              Connect your smart devices to start controlling them remotely
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
