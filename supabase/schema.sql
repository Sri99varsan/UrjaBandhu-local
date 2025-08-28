-- UrjaBandhu Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_notifications": true, "energy_tips": true, "weekly_reports": true}',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  energy_rate DECIMAL(10, 2) DEFAULT 8.00,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table
CREATE TABLE devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cooling', 'heating', 'lighting', 'appliance', 'entertainment'
  power_rating INTEGER NOT NULL, -- watts
  room TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  efficiency_score INTEGER DEFAULT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consumption_data table for time series data
CREATE TABLE consumption_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  consumption_kwh DECIMAL(10, 4) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'efficiency', 'timing', 'upgrade', 'behavior'
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- 'cooling', 'heating', 'lighting', 'appliance'
  action TEXT NOT NULL,
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_images table for OCR functionality
CREATE TABLE device_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  detected_device_type TEXT,
  detected_power_rating INTEGER,
  confidence_score DECIMAL(3, 2),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table for AI chatbot
CREATE TABLE chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX consumption_data_user_id_timestamp_idx ON consumption_data(user_id, timestamp DESC);
CREATE INDEX consumption_data_device_id_idx ON consumption_data(device_id);
CREATE INDEX devices_user_id_idx ON devices(user_id);
CREATE INDEX recommendations_user_id_idx ON recommendations(user_id);
CREATE INDEX chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX chat_messages_session_id_idx ON chat_messages(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Devices policies
CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON devices FOR DELETE USING (auth.uid() = user_id);

-- Consumption data policies
CREATE POLICY "Users can view own consumption data" ON consumption_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumption data" ON consumption_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Device images policies
CREATE POLICY "Users can view own device images" ON device_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own device images" ON device_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own device images" ON device_images FOR UPDATE USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO profiles (id, email, full_name) VALUES 
('00000000-0000-0000-0000-000000000000', 'demo@urjabandhu.com', 'Demo User')
ON CONFLICT (id) DO NOTHING;

-- Sample devices for the demo user
INSERT INTO devices (user_id, name, type, power_rating, room, status, efficiency_score) VALUES
('00000000-0000-0000-0000-000000000000', 'Air Conditioner', 'cooling', 1500, 'Living Room', 'active', 78),
('00000000-0000-0000-0000-000000000000', 'Refrigerator', 'appliance', 200, 'Kitchen', 'active', 92),
('00000000-0000-0000-0000-000000000000', 'LED Lights', 'lighting', 120, 'All Rooms', 'active', 95),
('00000000-0000-0000-0000-000000000000', 'Washing Machine', 'appliance', 800, 'Utility Room', 'inactive', 88),
('00000000-0000-0000-0000-000000000000', 'Television', 'entertainment', 150, 'Living Room', 'active', 82)
ON CONFLICT DO NOTHING;

-- Sample consumption data (last 24 hours)
INSERT INTO consumption_data (user_id, timestamp, consumption_kwh, cost)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  NOW() - INTERVAL '1 hour' * generate_series(0, 23),
  ROUND((1.5 + random() * 2)::numeric, 2), -- Random consumption between 1.5-3.5 kWh
  ROUND((1.5 + random() * 2) * 8.5::numeric, 2) -- Cost at ₹8.5 per kWh
ON CONFLICT DO NOTHING;

-- Sample recommendations
INSERT INTO recommendations (user_id, type, priority, title, description, potential_savings, category, action) VALUES
('00000000-0000-0000-0000-000000000000', 'efficiency', 'high', 'Optimize AC Temperature', 'Set your AC to 24°C instead of 22°C to save ₹450/month', 450, 'cooling', 'Increase AC temperature by 2°C'),
('00000000-0000-0000-0000-000000000000', 'timing', 'medium', 'Shift Washing Schedule', 'Run washing machine during off-peak hours (11 PM - 6 AM) to save ₹180/month', 180, 'appliance', 'Use timer function for night operation'),
('00000000-0000-0000-0000-000000000000', 'upgrade', 'low', 'LED Bulb Replacement', 'Replace remaining incandescent bulbs with LEDs to save ₹120/month', 120, 'lighting', 'Upgrade to LED lighting')
ON CONFLICT DO NOTHING;
