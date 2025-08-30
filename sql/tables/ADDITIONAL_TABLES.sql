-- UrjaBandhu Additional Tables SQL
-- Copy and paste these in Supabase SQL Editor to add new tables

-- 1. Energy Alerts Table
CREATE TABLE energy_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_consumption', 'unusual_pattern', 'device_offline', 'cost_threshold')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 2),
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for energy_alerts
ALTER TABLE energy_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_alerts
CREATE POLICY "Users can view own energy alerts" ON energy_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy alerts" ON energy_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy alerts" ON energy_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy alerts" ON energy_alerts FOR DELETE USING (auth.uid() = user_id);

-- Create index for energy_alerts
CREATE INDEX energy_alerts_user_id_idx ON energy_alerts(user_id);
CREATE INDEX energy_alerts_created_at_idx ON energy_alerts(created_at DESC);

-- 2. Energy Goals Table
CREATE TABLE energy_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  target_consumption DECIMAL(10, 2) NOT NULL,
  target_cost DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_consumption DECIMAL(10, 2) DEFAULT 0,
  current_cost DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for energy_goals
ALTER TABLE energy_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_goals
CREATE POLICY "Users can view own energy goals" ON energy_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy goals" ON energy_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy goals" ON energy_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy goals" ON energy_goals FOR DELETE USING (auth.uid() = user_id);

-- Create index and trigger for energy_goals
CREATE INDEX energy_goals_user_id_idx ON energy_goals(user_id);
CREATE TRIGGER update_energy_goals_updated_at BEFORE UPDATE ON energy_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Device Categories Table (Reference table)
CREATE TABLE device_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  average_power_min INTEGER,
  average_power_max INTEGER,
  efficiency_tips JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample device categories
INSERT INTO device_categories (name, description, icon, average_power_min, average_power_max, efficiency_tips) VALUES
('Air Conditioner', 'Cooling and heating appliances', 'snowflake', 1000, 3000, '["Set temperature to 24°C", "Use timer function", "Regular maintenance"]'),
('Refrigerator', 'Food storage appliances', 'refrigerator', 150, 400, '["Keep door closed", "Set optimal temperature", "Defrost regularly"]'),
('Lighting', 'Light fixtures and bulbs', 'lightbulb', 5, 100, '["Use LED bulbs", "Install motion sensors", "Use natural light"]'),
('Television', 'Entertainment devices', 'tv', 50, 300, '["Adjust brightness", "Use power saving mode", "Turn off when not in use"]'),
('Washing Machine', 'Laundry appliances', 'washing-machine', 500, 1200, '["Use cold water", "Full load washing", "Use eco mode"]'),
('Water Heater', 'Water heating appliances', 'water-drop', 1000, 4500, '["Set timer", "Insulate pipes", "Use solar heating"]');

-- 4. User Notifications Table
CREATE TABLE user_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'tip')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_text TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notifications
CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON user_notifications FOR DELETE USING (auth.uid() = user_id);

-- Create index for user_notifications
CREATE INDEX user_notifications_user_id_idx ON user_notifications(user_id);
CREATE INDEX user_notifications_created_at_idx ON user_notifications(created_at DESC);

-- 5. Energy Tariffs Table
CREATE TABLE energy_tariffs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  tariff_name TEXT NOT NULL,
  tariff_type TEXT NOT NULL CHECK (tariff_type IN ('fixed', 'time_of_use', 'tiered')),
  rate_per_kwh DECIMAL(10, 4) NOT NULL,
  peak_hours JSONB, -- {"start": "18:00", "end": "22:00"}
  off_peak_rate DECIMAL(10, 4),
  connection_charges DECIMAL(10, 2) DEFAULT 0,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for energy_tariffs
ALTER TABLE energy_tariffs ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_tariffs
CREATE POLICY "Users can view own tariffs" ON energy_tariffs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tariffs" ON energy_tariffs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tariffs" ON energy_tariffs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tariffs" ON energy_tariffs FOR DELETE USING (auth.uid() = user_id);

-- Create index and trigger for energy_tariffs
CREATE INDEX energy_tariffs_user_id_idx ON energy_tariffs(user_id);
CREATE TRIGGER update_energy_tariffs_updated_at BEFORE UPDATE ON energy_tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Device Schedules Table
CREATE TABLE device_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE NOT NULL,
  schedule_name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'custom')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for device_schedules
ALTER TABLE device_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for device_schedules
CREATE POLICY "Users can view own device schedules" ON device_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own device schedules" ON device_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own device schedules" ON device_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own device schedules" ON device_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create index and trigger for device_schedules
CREATE INDEX device_schedules_user_id_idx ON device_schedules(user_id);
CREATE INDEX device_schedules_device_id_idx ON device_schedules(device_id);
CREATE TRIGGER update_device_schedules_updated_at BEFORE UPDATE ON device_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Energy Reports Table
CREATE TABLE energy_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  report_date DATE NOT NULL,
  total_consumption DECIMAL(10, 4) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  peak_consumption DECIMAL(10, 4),
  peak_time TIMESTAMP WITH TIME ZONE,
  average_consumption DECIMAL(10, 4),
  efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  comparison_previous JSONB, -- {"consumption": "+5%", "cost": "-2%"}
  top_devices JSONB, -- [{"name": "AC", "consumption": 45.5}]
  recommendations JSONB, -- ["Reduce AC usage during peak hours"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for energy_reports
ALTER TABLE energy_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_reports
CREATE POLICY "Users can view own energy reports" ON energy_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy reports" ON energy_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for energy_reports
CREATE INDEX energy_reports_user_id_idx ON energy_reports(user_id);
CREATE INDEX energy_reports_date_idx ON energy_reports(report_date DESC);
CREATE INDEX energy_reports_type_idx ON energy_reports(report_type);

-- 8. User Preferences Table (Extended from profiles)
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dashboard_layout JSONB DEFAULT '{"widgets": ["consumption", "cost", "devices", "recommendations"]}',
  chart_preferences JSONB DEFAULT '{"default_period": "week", "chart_type": "line"}',
  alert_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  energy_saving_mode BOOLEAN DEFAULT FALSE,
  auto_recommendations BOOLEAN DEFAULT TRUE,
  data_sharing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demo user
INSERT INTO energy_alerts (user_id, alert_type, title, message, threshold_value, priority) VALUES
('00000000-0000-0000-0000-000000000000', 'high_consumption', 'High Energy Usage Detected', 'Your energy consumption is 25% higher than usual today.', 50.00, 'high'),
('00000000-0000-0000-0000-000000000000', 'cost_threshold', 'Monthly Budget Alert', 'You have reached 80% of your monthly energy budget.', 2000.00, 'medium')
ON CONFLICT DO NOTHING;

INSERT INTO energy_goals (user_id, goal_type, target_consumption, target_cost, start_date, end_date) VALUES
('00000000-0000-0000-0000-000000000000', 'monthly', 200.00, 1600.00, '2025-08-01', '2025-08-31'),
('00000000-0000-0000-0000-000000000000', 'daily', 8.00, 64.00, '2025-08-28', '2025-08-28')
ON CONFLICT DO NOTHING;

INSERT INTO user_notifications (user_id, title, message, type, action_text, action_url) VALUES
('00000000-0000-0000-0000-000000000000', 'Welcome to UrjaBandhu!', 'Start tracking your energy consumption and save money.', 'success', 'Get Started', '/dashboard'),
('00000000-0000-0000-0000-000000000000', 'Energy Saving Tip', 'Set your AC to 24°C to save up to 20% on electricity bills.', 'tip', 'Learn More', '/tips')
ON CONFLICT DO NOTHING;
