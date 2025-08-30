-- MANUAL DATABASE SETUP FOR URJABANDHU
-- Copy and paste this entire script in your Supabase SQL Editor and run it

-- 1. Profiles Table (User profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  electricity_board TEXT,
  monthly_budget DECIMAL(10, 2),
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Devices Table (User's appliances and devices)
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  power_rating INTEGER NOT NULL, -- in watts
  room TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  efficiency_score DECIMAL(3, 2), -- 0.00 to 10.00
  purchase_date DATE,
  warranty_expiry DATE,
  usage_hours_per_day DECIMAL(4, 2),
  is_smart_device BOOLEAN DEFAULT FALSE,
  device_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create policies for devices
DROP POLICY IF EXISTS "Users can view own devices" ON devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON devices;
DROP POLICY IF EXISTS "Users can update own devices" ON devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON devices;

CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON devices FOR DELETE USING (auth.uid() = user_id);

-- 3. Consumption Data Table (Energy consumption records)
CREATE TABLE IF NOT EXISTS consumption_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  consumption_kwh DECIMAL(10, 4) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  rate_per_unit DECIMAL(8, 4),
  reading_type TEXT DEFAULT 'actual' CHECK (reading_type IN ('actual', 'estimated', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for consumption_data
ALTER TABLE consumption_data ENABLE ROW LEVEL SECURITY;

-- Create policies for consumption_data
DROP POLICY IF EXISTS "Users can view own consumption data" ON consumption_data;
DROP POLICY IF EXISTS "Users can insert own consumption data" ON consumption_data;
DROP POLICY IF EXISTS "Users can update own consumption data" ON consumption_data;
DROP POLICY IF EXISTS "Users can delete own consumption data" ON consumption_data;

CREATE POLICY "Users can view own consumption data" ON consumption_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumption data" ON consumption_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consumption data" ON consumption_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consumption data" ON consumption_data FOR DELETE USING (auth.uid() = user_id);

-- 4. Recommendations Table (AI-generated energy saving recommendations)
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  is_applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendations
DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can delete own recommendations" ON recommendations;

CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recommendations" ON recommendations FOR DELETE USING (auth.uid() = user_id);

-- 5. Energy Alerts Table (System alerts and notifications)
CREATE TABLE IF NOT EXISTS energy_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_consumption', 'unusual_pattern', 'device_offline', 'cost_threshold', 'goal_achieved')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 2),
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for energy_alerts
ALTER TABLE energy_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_alerts
DROP POLICY IF EXISTS "Users can view own energy alerts" ON energy_alerts;
DROP POLICY IF EXISTS "Users can insert own energy alerts" ON energy_alerts;
DROP POLICY IF EXISTS "Users can update own energy alerts" ON energy_alerts;
DROP POLICY IF EXISTS "Users can delete own energy alerts" ON energy_alerts;

CREATE POLICY "Users can view own energy alerts" ON energy_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy alerts" ON energy_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy alerts" ON energy_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy alerts" ON energy_alerts FOR DELETE USING (auth.uid() = user_id);

-- 6. Energy Goals Table (User-defined energy saving goals)
CREATE TABLE IF NOT EXISTS energy_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('consumption_reduction', 'cost_reduction', 'device_efficiency')),
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  unit TEXT NOT NULL, -- kwh, rupees, percentage
  target_date DATE,
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for energy_goals
ALTER TABLE energy_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for energy_goals
DROP POLICY IF EXISTS "Users can view own energy goals" ON energy_goals;
DROP POLICY IF EXISTS "Users can insert own energy goals" ON energy_goals;
DROP POLICY IF EXISTS "Users can update own energy goals" ON energy_goals;
DROP POLICY IF EXISTS "Users can delete own energy goals" ON energy_goals;

CREATE POLICY "Users can view own energy goals" ON energy_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy goals" ON energy_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy goals" ON energy_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy goals" ON energy_goals FOR DELETE USING (auth.uid() = user_id);

-- 7. Billing Data Table (Electricity bill information)
CREATE TABLE IF NOT EXISTS billing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_month DATE NOT NULL,
  total_units DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  rate_slab JSONB, -- Store rate slab information
  fixed_charges DECIMAL(10, 2) DEFAULT 0,
  fuel_surcharge DECIMAL(10, 2) DEFAULT 0,
  other_charges DECIMAL(10, 2) DEFAULT 0,
  bill_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for billing_data
ALTER TABLE billing_data ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_data
DROP POLICY IF EXISTS "Users can view own billing data" ON billing_data;
DROP POLICY IF EXISTS "Users can insert own billing data" ON billing_data;
DROP POLICY IF EXISTS "Users can update own billing data" ON billing_data;
DROP POLICY IF EXISTS "Users can delete own billing data" ON billing_data;

CREATE POLICY "Users can view own billing data" ON billing_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own billing data" ON billing_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own billing data" ON billing_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own billing data" ON billing_data FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices(user_id);
CREATE INDEX IF NOT EXISTS devices_type_idx ON devices(type);
CREATE INDEX IF NOT EXISTS consumption_data_user_id_idx ON consumption_data(user_id);
CREATE INDEX IF NOT EXISTS consumption_data_device_id_idx ON consumption_data(device_id);
CREATE INDEX IF NOT EXISTS consumption_data_timestamp_idx ON consumption_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS recommendations_priority_idx ON recommendations(priority);
CREATE INDEX IF NOT EXISTS energy_alerts_user_id_idx ON energy_alerts(user_id);
CREATE INDEX IF NOT EXISTS energy_alerts_is_read_idx ON energy_alerts(is_read);
CREATE INDEX IF NOT EXISTS energy_goals_user_id_idx ON energy_goals(user_id);
CREATE INDEX IF NOT EXISTS billing_data_user_id_idx ON billing_data(user_id);
CREATE INDEX IF NOT EXISTS billing_data_bill_month_idx ON billing_data(bill_month DESC);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
DROP TRIGGER IF EXISTS update_recommendations_updated_at ON recommendations;
DROP TRIGGER IF EXISTS update_energy_goals_updated_at ON energy_goals;
DROP TRIGGER IF EXISTS update_billing_data_updated_at ON billing_data;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_energy_goals_updated_at BEFORE UPDATE ON energy_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_data_updated_at BEFORE UPDATE ON billing_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- INSERT SAMPLE DATA FOR TESTING

-- Insert sample devices for testing (if no user exists, create one for demo)
INSERT INTO devices (user_id, name, type, brand, power_rating, room, usage_hours_per_day) VALUES 
('00000000-0000-0000-0000-000000000000', 'Living Room AC', 'air_conditioner', 'Samsung', 1500, 'Living Room', 8.0),
('00000000-0000-0000-0000-000000000000', 'Kitchen Microwave', 'microwave', 'LG', 900, 'Kitchen', 1.0),
('00000000-0000-0000-0000-000000000000', 'Bedroom TV', 'television', 'Sony', 110, 'Bedroom', 4.0)
ON CONFLICT DO NOTHING;

-- Insert sample consumption data
INSERT INTO consumption_data (user_id, device_id, timestamp, consumption_kwh, cost) VALUES 
('00000000-0000-0000-0000-000000000000', (SELECT id FROM devices LIMIT 1), NOW() - INTERVAL '1 day', 12.5, 75.0),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM devices LIMIT 1), NOW() - INTERVAL '2 days', 11.8, 70.8)
ON CONFLICT DO NOTHING;

-- Insert sample recommendations
INSERT INTO recommendations (user_id, type, priority, title, description, potential_savings, category, action) VALUES 
('00000000-0000-0000-0000-000000000000', 'efficiency', 'high', 'Replace Old AC', 'Your AC is consuming 20% more energy than optimal. Consider upgrading to a 5-star rated model.', 500.0, 'cooling', 'upgrade_device'),
('00000000-0000-0000-0000-000000000000', 'usage', 'medium', 'Optimize TV Usage', 'Reduce TV usage by 2 hours daily to save energy.', 200.0, 'entertainment', 'reduce_usage')
ON CONFLICT DO NOTHING;

-- VERIFICATION QUERIES (Run these to verify setup)
SELECT 'Profiles Table' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Devices Table', COUNT(*) FROM devices
UNION ALL
SELECT 'Consumption Data', COUNT(*) FROM consumption_data
UNION ALL
SELECT 'Recommendations', COUNT(*) FROM recommendations
UNION ALL
SELECT 'Energy Alerts', COUNT(*) FROM energy_alerts
UNION ALL
SELECT 'Energy Goals', COUNT(*) FROM energy_goals
UNION ALL
SELECT 'Billing Data', COUNT(*) FROM billing_data
UNION ALL
SELECT 'Device Catalog', COUNT(*) FROM device_catalog;

-- Test the OCR device search function
SELECT 'OCR Search Test:' as test, search_devices_by_keywords('air conditioner') as result;
