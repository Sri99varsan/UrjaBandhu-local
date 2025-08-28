-- Phase 3B: Smart Automation & Controls Database Schema
-- This creates tables for automation rules, device controls, scheduling, and notifications

-- Table for automation rules
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule conditions (JSON format for flexibility)
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Rule actions (JSON format for flexibility)
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Rule configuration
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    
    -- Execution constraints
    max_executions_per_day INTEGER DEFAULT NULL,
    cooldown_minutes INTEGER DEFAULT 5,
    
    -- Timing
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    execution_count INTEGER DEFAULT 0
);

-- Table for device schedules
CREATE TABLE IF NOT EXISTS device_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Schedule configuration
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly')),
    
    -- Timing
    start_time TIME NOT NULL,
    end_time TIME,
    date_start DATE DEFAULT NULL,
    date_end DATE DEFAULT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
    
    -- Action to perform
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('turn_on', 'turn_off', 'set_power', 'optimize')),
    action_parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Configuration
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    next_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Table for device control capabilities and current state
CREATE TABLE IF NOT EXISTS device_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    
    -- Control capabilities
    can_turn_on_off BOOLEAN DEFAULT false,
    can_set_power_level BOOLEAN DEFAULT false,
    can_schedule BOOLEAN DEFAULT false,
    can_monitor_realtime BOOLEAN DEFAULT false,
    
    -- Current state
    current_state VARCHAR(50) DEFAULT 'unknown' CHECK (current_state IN ('on', 'off', 'standby', 'error', 'unknown')),
    current_power_level DECIMAL(10,2) DEFAULT NULL, -- Percentage 0-100
    current_consumption DECIMAL(10,2) DEFAULT 0, -- Current kW
    
    -- Power settings
    min_power_level DECIMAL(10,2) DEFAULT 0,
    max_power_level DECIMAL(10,2) DEFAULT 100,
    
    -- Control endpoints (for smart home integration)
    control_endpoint VARCHAR(255) DEFAULT NULL,
    control_protocol VARCHAR(50) DEFAULT NULL, -- 'mqtt', 'http', 'websocket', etc.
    control_credentials JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_command_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_command_status VARCHAR(50) DEFAULT NULL
);

-- Table for automation execution logs
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- What was executed
    automation_type VARCHAR(50) NOT NULL CHECK (automation_type IN ('rule', 'schedule', 'manual', 'optimization')),
    automation_id UUID DEFAULT NULL, -- References automation_rules.id or device_schedules.id
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    
    -- Execution details
    action_type VARCHAR(100) NOT NULL,
    action_parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Results
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'skipped')),
    result_message TEXT,
    error_message TEXT DEFAULT NULL,
    
    -- Impact tracking
    energy_saved_kwh DECIMAL(10,3) DEFAULT NULL,
    cost_saved_amount DECIMAL(10,2) DEFAULT NULL,
    
    -- Timing
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER DEFAULT NULL
);

-- Table for user notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Notification type and priority
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'automation', 'alert')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Related entities
    related_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    related_automation_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    related_log_id UUID REFERENCES automation_logs(id) ON DELETE SET NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    
    -- Actions (JSON array of possible actions)
    actions JSONB DEFAULT '[]'::jsonb,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_next_execution ON automation_rules(user_id, is_enabled) WHERE is_enabled = true;

CREATE INDEX IF NOT EXISTS idx_device_schedules_user_id ON device_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_device_schedules_device_id ON device_schedules(device_id);
CREATE INDEX IF NOT EXISTS idx_device_schedules_enabled ON device_schedules(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_device_schedules_next_execution ON device_schedules(next_execution_at) WHERE is_enabled = true;

CREATE INDEX IF NOT EXISTS idx_device_controls_device_id ON device_controls(device_id);
CREATE INDEX IF NOT EXISTS idx_device_controls_state ON device_controls(current_state);

CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id ON automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_device_id ON automation_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed_at ON automation_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_automation_logs_type ON automation_logs(automation_type);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Automation rules policies
CREATE POLICY "Users can view their own automation rules" ON automation_rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation rules" ON automation_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation rules" ON automation_rules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation rules" ON automation_rules
    FOR DELETE USING (auth.uid() = user_id);

-- Device schedules policies
CREATE POLICY "Users can view their own device schedules" ON device_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own device schedules" ON device_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device schedules" ON device_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device schedules" ON device_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Device controls policies (users can only control their own devices)
CREATE POLICY "Users can view controls for their own devices" ON device_controls
    FOR SELECT USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update controls for their own devices" ON device_controls
    FOR UPDATE USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Automation logs policies
CREATE POLICY "Users can view their own automation logs" ON automation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create automation logs" ON automation_logs
    FOR INSERT WITH CHECK (true); -- Allow system to log all actions

-- User notifications policies
CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" ON user_notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

-- Functions for automation triggers and updates

-- Function to update automation rule execution stats
CREATE OR REPLACE FUNCTION update_automation_rule_execution(rule_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE automation_rules 
    SET 
        last_executed_at = NOW(),
        execution_count = execution_count + 1,
        updated_at = NOW()
    WHERE id = rule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update device schedule next execution
CREATE OR REPLACE FUNCTION calculate_next_execution(schedule_id UUID)
RETURNS void AS $$
DECLARE
    schedule_record device_schedules%ROWTYPE;
    next_exec TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT * INTO schedule_record FROM device_schedules WHERE id = schedule_id;
    
    IF schedule_record.schedule_type = 'daily' THEN
        next_exec := (CURRENT_DATE + INTERVAL '1 day' + schedule_record.start_time);
    ELSIF schedule_record.schedule_type = 'weekly' THEN
        -- Calculate next week same day
        next_exec := (CURRENT_DATE + INTERVAL '7 days' + schedule_record.start_time);
    ELSIF schedule_record.schedule_type = 'once' THEN
        -- For one-time schedules, set to null after execution
        next_exec := NULL;
    ELSE
        next_exec := (CURRENT_DATE + INTERVAL '1 day' + schedule_record.start_time);
    END IF;
    
    UPDATE device_schedules 
    SET 
        next_execution_at = next_exec,
        last_executed_at = NOW()
    WHERE id = schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_user_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50) DEFAULT 'info',
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_device_id UUID DEFAULT NULL,
    p_automation_id UUID DEFAULT NULL,
    p_actions JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO user_notifications (
        user_id, title, message, type, priority, 
        related_device_id, related_automation_id, actions
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_priority,
        p_device_id, p_automation_id, p_actions
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add default device controls for existing devices
INSERT INTO device_controls (device_id, can_turn_on_off, can_monitor_realtime)
SELECT 
    id, 
    true, -- Most devices can be turned on/off
    true  -- Most devices can be monitored
FROM devices 
WHERE id NOT IN (SELECT device_id FROM device_controls);

COMMENT ON TABLE automation_rules IS 'User-defined automation rules with conditions and actions';
COMMENT ON TABLE device_schedules IS 'Time-based scheduling for device operations';
COMMENT ON TABLE device_controls IS 'Device control capabilities and current state information';
COMMENT ON TABLE automation_logs IS 'History of all automation actions executed';
COMMENT ON TABLE user_notifications IS 'User notifications and alerts from the system';
