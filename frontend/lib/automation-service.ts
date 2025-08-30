import { createClient } from './supabase'
import { format, addDays, addWeeks, addMonths, parseISO, isAfter, isBefore, getDay } from 'date-fns'

const supabase = createClient()

export interface AutomationRule {
  id: string
  user_id: string
  name: string
  description?: string
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  is_enabled: boolean
  priority: number
  max_executions_per_day?: number
  cooldown_minutes: number
  start_time?: string
  end_time?: string
  days_of_week: number[]
  created_at: string
  updated_at: string
  last_executed_at?: string
  execution_count: number
}

export interface DeviceSchedule {
  id: string
  user_id: string
  device_id: string
  name: string
  description?: string
  schedule_type: 'once' | 'daily' | 'weekly' | 'monthly'
  start_time: string
  end_time?: string
  date_start?: string
  date_end?: string
  days_of_week: number[]
  action_type: 'turn_on' | 'turn_off' | 'set_power' | 'optimize'
  action_parameters: Record<string, any>
  is_enabled: boolean
  priority: number
  created_at: string
  updated_at: string
  last_executed_at?: string
  next_execution_at?: string
}

export interface DeviceControl {
  id: string
  device_id: string
  can_turn_on_off: boolean
  can_set_power_level: boolean
  can_schedule: boolean
  can_monitor_realtime: boolean
  current_state: 'on' | 'off' | 'standby' | 'error' | 'unknown'
  current_power_level?: number
  current_consumption: number
  min_power_level: number
  max_power_level: number
  control_endpoint?: string
  control_protocol?: string
  control_credentials: Record<string, any>
  last_updated_at: string
  last_command_at?: string
  last_command_status?: string
}

export interface AutomationCondition {
  type: 'time' | 'consumption' | 'device_state' | 'cost' | 'weather'
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  device_id?: string
  comparison_value?: any
}

export interface AutomationAction {
  type: 'device_control' | 'notification' | 'schedule' | 'optimize'
  device_id?: string
  parameters: Record<string, any>
}

export interface AutomationLog {
  id: string
  user_id: string
  automation_type: 'rule' | 'schedule' | 'manual' | 'optimization'
  automation_id?: string
  device_id?: string
  action_type: string
  action_parameters: Record<string, any>
  status: 'success' | 'failed' | 'partial' | 'skipped'
  result_message?: string
  error_message?: string
  energy_saved_kwh?: number
  cost_saved_amount?: number
  executed_at: string
  duration_ms?: number
}

export interface UserNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'automation' | 'alert'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  related_device_id?: string
  related_automation_id?: string
  related_log_id?: string
  is_read: boolean
  is_dismissed: boolean
  actions: Array<{ label: string; action: string; parameters?: any }>
  created_at: string
  read_at?: string
  expires_at?: string
}

export const automationService = {
  // Automation Rules Management
  async getAutomationRules(userId: string): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching automation rules:', error)
      return this.generateDemoAutomationRules(userId)
    }

    return data || []
  },

  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at' | 'execution_count'>): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert([rule])
      .select()
      .single()

    if (error) {
      console.error('Error creating automation rule:', error)
      throw new Error('Failed to create automation rule')
    }

    return data
  },

  async updateAutomationRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating automation rule:', error)
      throw new Error('Failed to update automation rule')
    }

    return data
  },

  async deleteAutomationRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting automation rule:', error)
      throw new Error('Failed to delete automation rule')
    }
  },

  // Device Schedules Management
  async getDeviceSchedules(userId: string, deviceId?: string): Promise<DeviceSchedule[]> {
    let query = supabase
      .from('device_schedules')
      .select('*')
      .eq('user_id', userId)

    if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data, error } = await query.order('next_execution_at', { ascending: true })

    if (error) {
      console.error('Error fetching device schedules:', error)
      return this.generateDemoDeviceSchedules(userId)
    }

    return data || []
  },

  async createDeviceSchedule(schedule: Omit<DeviceSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<DeviceSchedule | null> {
    // Calculate next execution time
    const nextExecution = this.calculateNextExecution(schedule)
    
    const { data, error } = await supabase
      .from('device_schedules')
      .insert([{ ...schedule, next_execution_at: nextExecution }])
      .select()
      .single()

    if (error) {
      console.error('Error creating device schedule:', error)
      throw new Error('Failed to create device schedule')
    }

    return data
  },

  async updateDeviceSchedule(id: string, updates: Partial<DeviceSchedule>): Promise<DeviceSchedule | null> {
    const { data, error } = await supabase
      .from('device_schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating device schedule:', error)
      throw new Error('Failed to update device schedule')
    }

    return data
  },

  async deleteDeviceSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('device_schedules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting device schedule:', error)
      throw new Error('Failed to delete device schedule')
    }
  },

  // Device Controls Management
  async getDeviceControls(deviceIds?: string[]): Promise<DeviceControl[]> {
    let query = supabase.from('device_controls').select('*')

    if (deviceIds && deviceIds.length > 0) {
      query = query.in('device_id', deviceIds)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching device controls:', error)
      return this.generateDemoDeviceControls()
    }

    return data || []
  },

  async updateDeviceControl(deviceId: string, updates: Partial<DeviceControl>): Promise<DeviceControl | null> {
    const { data, error } = await supabase
      .from('device_controls')
      .update({ ...updates, last_updated_at: new Date().toISOString() })
      .eq('device_id', deviceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating device control:', error)
      throw new Error('Failed to update device control')
    }

    return data
  },

  // Automation Execution
  async executeDeviceAction(deviceId: string, action: AutomationAction, userId: string): Promise<AutomationLog> {
    const startTime = Date.now()
    let status: 'success' | 'failed' | 'partial' | 'skipped' = 'success'
    let resultMessage = ''
    let errorMessage = ''

    try {
      // Get device control info
      const deviceControl = await this.getDeviceControls([deviceId])
      if (!deviceControl || deviceControl.length === 0) {
        throw new Error('Device control not found')
      }

      const control = deviceControl[0]

      // Execute the action based on type
      switch (action.type) {
        case 'device_control':
          resultMessage = await this.executeDeviceControlAction(control, action.parameters)
          break
        case 'notification':
          await this.createNotification(userId, {
            title: action.parameters.title || 'Automation Notification',
            message: action.parameters.message || 'Action executed successfully',
            type: action.parameters.type || 'info',
            priority: action.parameters.priority || 'normal',
            actions: action.parameters.actions || []
          })
          resultMessage = 'Notification sent successfully'
          break
        case 'optimize':
          resultMessage = await this.executeOptimizationAction(deviceId, action.parameters)
          break
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

    } catch (error) {
      status = 'failed'
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error executing device action:', error)
    }

    // Log the execution
    const log: Omit<AutomationLog, 'id'> = {
      user_id: userId,
      automation_type: 'manual',
      device_id: deviceId,
      action_type: action.type,
      action_parameters: action.parameters,
      status,
      result_message: resultMessage || undefined,
      error_message: errorMessage || undefined,
      executed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime
    }

    return await this.createAutomationLog(log)
  },

  async executeDeviceControlAction(control: DeviceControl, parameters: any): Promise<string> {
    const { action, value } = parameters

    switch (action) {
      case 'turn_on':
        if (!control.can_turn_on_off) {
          throw new Error('Device cannot be turned on/off')
        }
        await this.updateDeviceControl(control.device_id, { 
          current_state: 'on',
          last_command_at: new Date().toISOString(),
          last_command_status: 'success'
        })
        return 'Device turned on successfully'

      case 'turn_off':
        if (!control.can_turn_on_off) {
          throw new Error('Device cannot be turned on/off')
        }
        await this.updateDeviceControl(control.device_id, { 
          current_state: 'off',
          last_command_at: new Date().toISOString(),
          last_command_status: 'success'
        })
        return 'Device turned off successfully'

      case 'set_power':
        if (!control.can_set_power_level) {
          throw new Error('Device power level cannot be controlled')
        }
        const powerLevel = Math.max(control.min_power_level, Math.min(control.max_power_level, value))
        await this.updateDeviceControl(control.device_id, { 
          current_power_level: powerLevel,
          last_command_at: new Date().toISOString(),
          last_command_status: 'success'
        })
        return `Device power level set to ${powerLevel}%`

      default:
        throw new Error(`Unknown device action: ${action}`)
    }
  },

  async executeOptimizationAction(deviceId: string, parameters: any): Promise<string> {
    // Implement optimization logic based on analytics
    // This is a placeholder for now
    return 'Device optimization applied successfully'
  },

  // Notifications Management
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<UserNotification[]> {
    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return this.generateDemoNotifications(userId)
    }

    return data || []
  },

  async createNotification(userId: string, notification: Omit<UserNotification, 'id' | 'user_id' | 'created_at' | 'is_read' | 'is_dismissed'>): Promise<UserNotification | null> {
    const { data, error } = await supabase
      .from('user_notifications')
      .insert([{ ...notification, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }

    return data
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  },

  async dismissNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_dismissed: true })
      .eq('id', id)

    if (error) {
      console.error('Error dismissing notification:', error)
      throw new Error('Failed to dismiss notification')
    }
  },

  // Automation Logs
  async createAutomationLog(log: Omit<AutomationLog, 'id'>): Promise<AutomationLog> {
    const { data, error } = await supabase
      .from('automation_logs')
      .insert([log])
      .select()
      .single()

    if (error) {
      console.error('Error creating automation log:', error)
      throw new Error('Failed to create automation log')
    }

    return data
  },

  async getAutomationLogs(userId: string, limit: number = 50): Promise<AutomationLog[]> {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching automation logs:', error)
      return []
    }

    return data || []
  },

  // Utility Functions
  calculateNextExecution(schedule: Partial<DeviceSchedule>): string | null {
    if (!schedule.start_time || !schedule.schedule_type) return null

    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    const startDateTime = new Date(`${today}T${schedule.start_time}`)

    switch (schedule.schedule_type) {
      case 'once':
        return schedule.date_start ? `${schedule.date_start}T${schedule.start_time}` : null
      
      case 'daily':
        if (isAfter(startDateTime, now)) {
          return startDateTime.toISOString()
        } else {
          return addDays(startDateTime, 1).toISOString()
        }
      
      case 'weekly':
        const targetDay = schedule.days_of_week?.[0] || getDay(now)
        let nextWeeklyExecution = startDateTime
        while (getDay(nextWeeklyExecution) !== targetDay || isBefore(nextWeeklyExecution, now)) {
          nextWeeklyExecution = addDays(nextWeeklyExecution, 1)
        }
        return nextWeeklyExecution.toISOString()
      
      case 'monthly':
        if (isAfter(startDateTime, now)) {
          return startDateTime.toISOString()
        } else {
          return addMonths(startDateTime, 1).toISOString()
        }
      
      default:
        return null
    }
  },

  // Demo Data Generators (for testing when database is empty)
  generateDemoAutomationRules(userId: string): AutomationRule[] {
    return [
      {
        id: 'demo-rule-1',
        user_id: userId,
        name: 'Energy Saver Mode',
        description: 'Turn off non-essential devices during peak hours',
        conditions: [{ type: 'time', operator: 'between', value: ['18:00', '22:00'] }],
        actions: [{ type: 'device_control', parameters: { action: 'turn_off' } }],
        is_enabled: true,
        priority: 1,
        cooldown_minutes: 30,
        days_of_week: [1, 2, 3, 4, 5],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        execution_count: 15
      }
    ]
  },

  generateDemoDeviceSchedules(userId: string): DeviceSchedule[] {
    return [
      {
        id: 'demo-schedule-1',
        user_id: userId,
        device_id: 'demo-device-1',
        name: 'Morning Water Heater',
        description: 'Turn on water heater every morning',
        schedule_type: 'daily',
        start_time: '06:00',
        end_time: '07:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        action_type: 'turn_on',
        action_parameters: {},
        is_enabled: true,
        priority: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        next_execution_at: addDays(new Date(), 1).toISOString()
      }
    ]
  },

  generateDemoDeviceControls(): DeviceControl[] {
    return [
      {
        id: 'demo-control-1',
        device_id: 'demo-device-1',
        can_turn_on_off: true,
        can_set_power_level: true,
        can_schedule: true,
        can_monitor_realtime: true,
        current_state: 'on',
        current_power_level: 75,
        current_consumption: 2.5,
        min_power_level: 0,
        max_power_level: 100,
        control_credentials: {},
        last_updated_at: new Date().toISOString()
      }
    ]
  },

  generateDemoNotifications(userId: string): UserNotification[] {
    return [
      {
        id: 'demo-notification-1',
        user_id: userId,
        title: 'Energy Optimization Applied',
        message: 'Your AC has been optimized to save 15% energy during peak hours',
        type: 'success',
        priority: 'normal',
        is_read: false,
        is_dismissed: false,
        actions: [],
        created_at: new Date().toISOString()
      }
    ]
  }
}
