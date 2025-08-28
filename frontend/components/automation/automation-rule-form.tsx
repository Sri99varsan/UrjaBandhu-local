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
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, Clock, Zap, Settings, Bell } from 'lucide-react'
import { automationService, AutomationCondition, AutomationAction } from '@/lib/automation-service'

const automationRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_enabled: z.boolean(),
  priority: z.number().min(1).max(10),
  max_executions_per_day: z.number().optional(),
  cooldown_minutes: z.number().min(0),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  days_of_week: z.array(z.number().min(0).max(6))
})

interface AutomationRuleFormProps {
  userId: string
  onSuccess: () => void
}

export function AutomationRuleForm({ userId, onSuccess }: AutomationRuleFormProps) {
  const [conditions, setConditions] = useState<AutomationCondition[]>([
    { type: 'time', operator: 'greater_than', value: '18:00' }
  ])
  const [actions, setActions] = useState<AutomationAction[]>([
    { type: 'device_control', parameters: { action: 'turn_off' } }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof automationRuleSchema>>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      is_enabled: true,
      priority: 1,
      cooldown_minutes: 0,
      days_of_week: [1, 2, 3, 4, 5]
    }
  })

  const addCondition = () => {
    setConditions([...conditions, { type: 'time', operator: 'greater_than', value: '' }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, field: keyof AutomationCondition, value: any) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], [field]: value }
    setConditions(updated)
  }

  const addAction = () => {
    setActions([...actions, { type: 'device_control', parameters: {} }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, field: keyof AutomationAction, value: any) => {
    const updated = [...actions]
    updated[index] = { ...updated[index], [field]: value }
    setActions(updated)
  }

  const updateActionParameter = (index: number, paramKey: string, paramValue: any) => {
    const updated = [...actions]
    updated[index] = {
      ...updated[index],
      parameters: { ...updated[index].parameters, [paramKey]: paramValue }
    }
    setActions(updated)
  }

  const onSubmit = async (data: z.infer<typeof automationRuleSchema>) => {
    try {
      setIsSubmitting(true)
      
      await automationService.createAutomationRule({
        user_id: userId,
        name: data.name,
        description: data.description,
        conditions,
        actions,
        is_enabled: data.is_enabled,
        priority: data.priority,
        max_executions_per_day: data.max_executions_per_day,
        cooldown_minutes: data.cooldown_minutes,
        start_time: data.start_time,
        end_time: data.end_time,
        days_of_week: data.days_of_week,
        last_executed_at: undefined
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating automation rule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Energy Saver Mode"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
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
              <Label htmlFor="is_enabled">Enable Rule</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooldown_minutes">Cooldown (minutes)</Label>
              <Input
                id="cooldown_minutes"
                type="number"
                min="0"
                placeholder="0"
                {...form.register('cooldown_minutes', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_executions_per_day">Max executions/day</Label>
              <Input
                id="max_executions_per_day"
                type="number"
                min="1"
                placeholder="Unlimited"
                {...form.register('max_executions_per_day', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Constraints</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Active From (Optional)</Label>
              <Input
                id="start_time"
                type="time"
                {...form.register('start_time')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Active Until (Optional)</Label>
              <Input
                id="end_time"
                type="time"
                {...form.register('end_time')}
              />
            </div>
          </div>

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
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Conditions</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
              <Select
                value={condition.type}
                onValueChange={(value: string) => updateCondition(index, 'type', value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="consumption">Consumption</SelectItem>
                  <SelectItem value="device_state">Device State</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(value: string) => updateCondition(index, 'operator', value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="greater_than">Greater than</SelectItem>
                  <SelectItem value="less_than">Less than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Value"
                value={condition.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCondition(index, 'value', e.target.value)}
                className="flex-1"
              />

              {conditions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCondition(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Actions</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <div key={index} className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Select
                  value={action.type}
                  onValueChange={(value: string) => updateAction(index, 'type', value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="device_control">Device Control</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="optimize">Optimize</SelectItem>
                  </SelectContent>
                </Select>

                {actions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAction(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Action-specific parameters */}
              {action.type === 'device_control' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select
                    value={action.parameters.action || ''}
                    onValueChange={(value: string) => updateActionParameter(index, 'action', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turn_on">Turn On</SelectItem>
                      <SelectItem value="turn_off">Turn Off</SelectItem>
                      <SelectItem value="set_power">Set Power Level</SelectItem>
                    </SelectContent>
                  </Select>

                  {action.parameters.action === 'set_power' && (
                    <Input
                      type="number"
                      placeholder="Power level (0-100)"
                      min="0"
                      max="100"
                      value={action.parameters.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateActionParameter(index, 'value', parseInt(e.target.value))}
                    />
                  )}
                </div>
              )}

              {action.type === 'notification' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Notification title"
                    value={action.parameters.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateActionParameter(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Notification message"
                    value={action.parameters.message || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateActionParameter(index, 'message', e.target.value)}
                  />
                  <Select
                    value={action.parameters.type || 'info'}
                    onValueChange={(value: string) => updateActionParameter(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Rule'}
        </Button>
      </div>
    </form>
  )
}
