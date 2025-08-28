'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Clock, 
  Zap, 
  Bell, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Power,
  Timer,
  Lightbulb
} from 'lucide-react'
import { automationService, AutomationRule, DeviceSchedule, AutomationLog, UserNotification } from '@/lib/automation-service'
import { format, formatDistanceToNow } from 'date-fns'
import { AutomationRuleForm } from './automation-rule-form'
import { DeviceScheduleForm } from './device-schedule-form'
import { DeviceControlPanel } from './device-control-panel'

interface AutomationDashboardProps {
  userId: string
}

export function AutomationDashboard({ userId }: AutomationDashboardProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [deviceSchedules, setDeviceSchedules] = useState<DeviceSchedule[]>([])
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([])
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rules')
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  useEffect(() => {
    loadAutomationData()
  }, [userId])

  const loadAutomationData = async () => {
    try {
      setLoading(true)
      const [rules, schedules, logs, notifs] = await Promise.all([
        automationService.getAutomationRules(userId),
        automationService.getDeviceSchedules(userId),
        automationService.getAutomationLogs(userId, 20),
        automationService.getNotifications(userId)
      ])

      setAutomationRules(rules)
      setDeviceSchedules(schedules)
      setAutomationLogs(logs)
      setNotifications(notifs)
    } catch (error) {
      console.error('Error loading automation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isEnabled: boolean) => {
    try {
      await automationService.updateAutomationRule(ruleId, { is_enabled: !isEnabled })
      await loadAutomationData()
    } catch (error) {
      console.error('Error updating rule status:', error)
    }
  }

  const toggleScheduleStatus = async (scheduleId: string, isEnabled: boolean) => {
    try {
      await automationService.updateDeviceSchedule(scheduleId, { is_enabled: !isEnabled })
      await loadAutomationData()
    } catch (error) {
      console.error('Error updating schedule status:', error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    try {
      await automationService.deleteAutomationRule(ruleId)
      await loadAutomationData()
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    try {
      await automationService.deleteDeviceSchedule(scheduleId)
      await loadAutomationData()
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await automationService.markNotificationAsRead(notificationId)
      await loadAutomationData()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'automation':
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const automationStats = {
    totalRules: automationRules.length,
    activeRules: automationRules.filter(r => r.is_enabled).length,
    totalSchedules: deviceSchedules.length,
    activeSchedules: deviceSchedules.filter(s => s.is_enabled).length,
    recentExecutions: automationLogs.length,
    successRate: automationLogs.length > 0 
      ? Math.round((automationLogs.filter(l => l.status === 'success').length / automationLogs.length) * 100)
      : 0,
    unreadNotifications: notifications.filter(n => !n.is_read).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Loading automation...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Automation & Controls</h1>
          <p className="text-muted-foreground">
            Manage your devices, schedules, and automation rules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAutomationData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Rules</p>
                <p className="text-2xl font-bold">{automationStats.activeRules}/{automationStats.totalRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Schedules</p>
                <p className="text-2xl font-bold">{automationStats.activeSchedules}/{automationStats.totalSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Executions</p>
                <p className="text-2xl font-bold">{automationStats.recentExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{automationStats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">{automationStats.unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Energy Saved</p>
                <p className="text-2xl font-bold">12.5kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-sm font-medium">Cost Saved</p>
                <p className="text-2xl font-bold">₹245</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="schedules">Device Schedules</TabsTrigger>
          <TabsTrigger value="controls">Device Controls</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Automation Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Automation Rules</h2>
              <p className="text-muted-foreground">Create smart rules to automate your devices</p>
            </div>
            <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Automation Rule</DialogTitle>
                </DialogHeader>
                <AutomationRuleForm
                  userId={userId}
                  onSuccess={() => {
                    setShowRuleForm(false)
                    loadAutomationData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{rule.name}</span>
                        <Badge variant={rule.is_enabled ? 'default' : 'secondary'}>
                          {rule.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">Priority {rule.priority}</Badge>
                      </CardTitle>
                      {rule.description && (
                        <CardDescription>{rule.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRuleStatus(rule.id, rule.is_enabled)}
                      >
                        {rule.is_enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Conditions</p>
                      <p className="text-muted-foreground">
                        {rule.conditions.length} condition(s) defined
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Actions</p>
                      <p className="text-muted-foreground">
                        {rule.actions.length} action(s) defined
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Executions</p>
                      <p className="text-muted-foreground">
                        {rule.execution_count} times executed
                      </p>
                      {rule.last_executed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {automationRules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first automation rule to start saving energy automatically
                  </p>
                  <Button onClick={() => setShowRuleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Device Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Device Schedules</h2>
              <p className="text-muted-foreground">Schedule your devices to operate at specific times</p>
            </div>
            <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Device Schedule</DialogTitle>
                </DialogHeader>
                <DeviceScheduleForm
                  userId={userId}
                  onSuccess={() => {
                    setShowScheduleForm(false)
                    loadAutomationData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {deviceSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{schedule.name}</span>
                        <Badge variant={schedule.is_enabled ? 'default' : 'secondary'}>
                          {schedule.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {schedule.schedule_type}
                        </Badge>
                      </CardTitle>
                      {schedule.description && (
                        <CardDescription>{schedule.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduleStatus(schedule.id, schedule.is_enabled)}
                      >
                        {schedule.is_enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSchedule(schedule.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Time</p>
                      <p className="text-muted-foreground">
                        {schedule.start_time}
                        {schedule.end_time && ` - ${schedule.end_time}`}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Action</p>
                      <p className="text-muted-foreground capitalize">
                        {schedule.action_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Days</p>
                      <p className="text-muted-foreground">
                        {schedule.days_of_week.length === 7 
                          ? 'Every day' 
                          : `${schedule.days_of_week.length} days/week`}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Next Execution</p>
                      {schedule.next_execution_at ? (
                        <p className="text-muted-foreground">
                          {formatDistanceToNow(new Date(schedule.next_execution_at), { addSuffix: true })}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">Not scheduled</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {deviceSchedules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No schedules created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create schedules to automatically control your devices at specific times
                  </p>
                  <Button onClick={() => setShowScheduleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Schedule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Device Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Device Controls</h2>
            <p className="text-muted-foreground">Monitor and control your devices in real-time</p>
          </div>
          <DeviceControlPanel userId={userId} />
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Activity Logs</h2>
            <p className="text-muted-foreground">Track all automation executions and device actions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {automationLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="mt-1">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {log.action_type.replace('_', ' ')} 
                            <span className="text-muted-foreground capitalize">
                              {' '}• {log.automation_type}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.executed_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        {log.result_message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.result_message}
                          </p>
                        )}
                        {log.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {log.error_message}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {log.duration_ms && (
                            <span>Duration: {log.duration_ms}ms</span>
                          )}
                          {log.energy_saved_kwh && (
                            <span>Energy saved: {log.energy_saved_kwh}kWh</span>
                          )}
                          {log.cost_saved_amount && (
                            <span>Cost saved: ₹{log.cost_saved_amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {automationLogs.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No activity logs yet</h3>
                      <p className="text-muted-foreground">
                        Activity logs will appear here when automation rules execute
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with automation alerts and device status</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={notification.priority === 'high' ? 'destructive' : 'outline'}>
                              {notification.priority}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        {notification.actions.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            {notification.actions.map((action, index) => (
                              <Button key={index} variant="outline" size="sm">
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                      <p className="text-muted-foreground">
                        Notifications about your automation and devices will appear here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
