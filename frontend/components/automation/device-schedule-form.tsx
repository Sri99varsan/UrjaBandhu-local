'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Power, Settings } from 'lucide-react'
import { automationService } from '@/lib/automation-service'

const deviceScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  device_id: z.string().min(1, 'Device is required'),
  schedule_type: z.enum(['once', 'daily', 'weekly', 'monthly']),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().optional(),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  days_of_week: z.array(z.number().min(0).max(6)),
  action_type: z.enum(['turn_on', 'turn_off', 'set_power', 'optimize']),
  action_parameters: z.record(z.string(), z.any()),
  is_enabled: z.boolean(),
  priority: z.number().min(1).max(10)
})

interface DeviceScheduleFormProps {
  userId: string
  onSuccess: () => void
}

export function DeviceScheduleForm({ userId, onSuccess }: DeviceScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof deviceScheduleSchema>>({
    resolver: zodResolver(deviceScheduleSchema),
    defaultValues: {
      name: '',
      description: '',
      device_id: '',
      schedule_type: 'daily',
      start_time: '',
      end_time: '',
      date_start: '',
      date_end: '',
      days_of_week: [1, 2, 3, 4, 5],
      action_type: 'turn_on',
      action_parameters: {},
      is_enabled: true,
      priority: 1
    }
  })

  const onSubmit = async (data: z.infer<typeof deviceScheduleSchema>) => {
    try {
      setIsSubmitting(true)
      
      await automationService.createDeviceSchedule({
        user_id: userId,
        device_id: data.device_id,
        name: data.name,
        description: data.description,
        schedule_type: data.schedule_type,
        start_time: data.start_time,
        end_time: data.end_time,
        date_start: data.date_start,
        date_end: data.date_end,
        days_of_week: data.days_of_week,
        action_type: data.action_type,
        action_parameters: data.action_parameters,
        is_enabled: data.is_enabled,
        priority: data.priority
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating device schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const scheduleType = form.watch('schedule_type')
  const actionType = form.watch('action_type')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Schedule Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Water Heater"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_id">Device</Label>
              <Select
                value={form.watch('device_id')}
                onValueChange={(value: string) => form.setValue('device_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo-device-1">Water Heater</SelectItem>
                  <SelectItem value="demo-device-2">Air Conditioner</SelectItem>
                  <SelectItem value="demo-device-3">Washing Machine</SelectItem>
                  <SelectItem value="demo-device-4">Electric Car Charger</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.device_id && (
                <p className="text-sm text-red-600">{form.formState.errors.device_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this schedule does..."
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_enabled"
                checked={form.watch('is_enabled')}
                onCheckedChange={(checked: boolean) => form.setValue('is_enabled', checked)}
              />
              <Label htmlFor="is_enabled">Enable Schedule</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                {...form.register('priority', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Type & Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule_type">Schedule Type</Label>
              <Select
                value={form.watch('schedule_type')}
                onValueChange={(value: string) => form.setValue('schedule_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One Time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                {...form.register('start_time')}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-600">{form.formState.errors.start_time.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time (Optional)</Label>
              <Input
                id="end_time"
                type="time"
                {...form.register('end_time')}
              />
            </div>
          </div>

          {/* Date range for one-time schedules */}
          {scheduleType === 'once' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_start">Start Date</Label>
                <Input
                  id="date_start"
                  type="date"
                  {...form.register('date_start')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_end">End Date (Optional)</Label>
                <Input
                  id="date_end"
                  type="date"
                  {...form.register('date_end')}
                />
              </div>
            </div>
          )}

          {/* Days of week for recurring schedules */}
          {(scheduleType === 'weekly' || scheduleType === 'daily') && (
            <div className="space-y-2">
              <Label>Active Days</Label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => (
                  <Badge
                    key={index}
                    variant={form.watch('days_of_week').includes(index) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentDays = form.watch('days_of_week')
                      if (currentDays.includes(index)) {
                        form.setValue('days_of_week', currentDays.filter(d => d !== index))
                      } else {
                        form.setValue('days_of_week', [...currentDays, index])
                      }
                    }}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Power className="h-5 w-5" />
            <span>Action Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_type">Action Type</Label>
              <Select
                value={form.watch('action_type')}
                onValueChange={(value: string) => form.setValue('action_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turn_on">Turn On</SelectItem>
                  <SelectItem value="turn_off">Turn Off</SelectItem>
                  <SelectItem value="set_power">Set Power Level</SelectItem>
                  <SelectItem value="optimize">Optimize Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionType === 'set_power' && (
              <div className="space-y-2">
                <Label htmlFor="power_level">Power Level (%)</Label>
                <Input
                  id="power_level"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 75"
                  value={(form.watch('action_parameters') as any)?.power_level || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const actionParams = form.watch('action_parameters') || {}
                    form.setValue('action_parameters', {
                      ...actionParams,
                      power_level: parseInt(e.target.value) || 0
                    })
                  }}
                />
              </div>
            )}
          </div>

          {actionType === 'optimize' && (
            <div className="space-y-2">
              <Label htmlFor="optimization_mode">Optimization Mode</Label>
              <Select
                value={(form.watch('action_parameters') as any)?.optimization_mode || 'energy_saving'}
                onValueChange={(value: string) => {
                  const actionParams = form.watch('action_parameters') || {}
                  form.setValue('action_parameters', {
                    ...actionParams,
                    optimization_mode: value
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energy_saving">Energy Saving</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="eco_mode">Eco Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  )
}
