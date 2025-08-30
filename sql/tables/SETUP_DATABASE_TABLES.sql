-- UrjaBandhu Database Setup Script
-- Run this in your Supabase SQL Editor

-- This script will ensure all tables exist and create sample data if needed

-- Check if tables exist and create them if they don't
DO $$
BEGIN
  -- Create devices table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'devices') THEN
    CREATE TABLE devices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      power_rating INTEGER NOT NULL,
      room TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      efficiency_score INTEGER DEFAULT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own devices" ON devices FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own devices" ON devices FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own devices" ON devices FOR DELETE USING (auth.uid() = user_id);
    
    -- Create index
    CREATE INDEX devices_user_id_idx ON devices(user_id);
    
    RAISE NOTICE 'Created devices table';
  END IF;

  -- Create consumption_data table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'consumption_data') THEN
    CREATE TABLE consumption_data (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      consumption_kwh DECIMAL(10, 4) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE consumption_data ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own consumption data" ON consumption_data FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own consumption data" ON consumption_data FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Create indexes
    CREATE INDEX consumption_data_user_id_timestamp_idx ON consumption_data(user_id, timestamp DESC);
    CREATE INDEX consumption_data_device_id_idx ON consumption_data(device_id);
    
    RAISE NOTICE 'Created consumption_data table';
  END IF;

  -- Create recommendations table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recommendations') THEN
    CREATE TABLE recommendations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      potential_savings DECIMAL(10, 2) NOT NULL,
      category TEXT NOT NULL,
      action TEXT NOT NULL,
      is_applied BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);
    
    -- Create index
    CREATE INDEX recommendations_user_id_idx ON recommendations(user_id);
    
    RAISE NOTICE 'Created recommendations table';
  END IF;
END
$$;

-- Create function to insert sample data for a user
CREATE OR REPLACE FUNCTION create_sample_data_for_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert sample devices if none exist for this user
  IF NOT EXISTS (SELECT 1 FROM devices WHERE user_id = target_user_id) THEN
    INSERT INTO devices (user_id, name, type, power_rating, room, status, efficiency_score) VALUES
    (target_user_id, 'Air Conditioner', 'cooling', 1500, 'Living Room', 'active', 78),
    (target_user_id, 'Refrigerator', 'appliance', 200, 'Kitchen', 'active', 92),
    (target_user_id, 'LED Lights', 'lighting', 120, 'All Rooms', 'active', 95),
    (target_user_id, 'Washing Machine', 'appliance', 800, 'Utility Room', 'inactive', 88),
    (target_user_id, 'Television', 'entertainment', 150, 'Living Room', 'active', 82);
    
    RAISE NOTICE 'Created sample devices for user %', target_user_id;
  END IF;

  -- Insert sample consumption data for the last 24 hours if none exists
  IF NOT EXISTS (SELECT 1 FROM consumption_data WHERE user_id = target_user_id) THEN
    INSERT INTO consumption_data (user_id, timestamp, consumption_kwh, cost)
    SELECT 
      target_user_id,
      NOW() - INTERVAL '1 hour' * generate_series(0, 23),
      ROUND((1.5 + random() * 2)::numeric, 4), -- Random consumption between 1.5-3.5 kWh
      ROUND((1.5 + random() * 2) * 8.5::numeric, 2) -- Cost at ₹8.5 per kWh
    FROM generate_series(0, 23);
    
    RAISE NOTICE 'Created sample consumption data for user %', target_user_id;
  END IF;

  -- Insert sample recommendations if none exist
  IF NOT EXISTS (SELECT 1 FROM recommendations WHERE user_id = target_user_id) THEN
    INSERT INTO recommendations (user_id, type, priority, title, description, potential_savings, category, action) VALUES
    (target_user_id, 'efficiency', 'high', 'Optimize AC Temperature', 'Set your AC to 24°C instead of 22°C to save ₹450/month', 450, 'cooling', 'Increase AC temperature by 2°C'),
    (target_user_id, 'timing', 'medium', 'Shift Washing Schedule', 'Run washing machine during off-peak hours (11 PM - 6 AM) to save ₹180/month', 180, 'appliance', 'Use timer function for night operation'),
    (target_user_id, 'upgrade', 'low', 'LED Bulb Replacement', 'Replace remaining incandescent bulbs with LEDs to save ₹120/month', 120, 'lighting', 'Upgrade to LED lighting');
    
    RAISE NOTICE 'Created sample recommendations for user %', target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
