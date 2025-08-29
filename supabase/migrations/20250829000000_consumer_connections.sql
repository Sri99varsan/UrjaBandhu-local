-- Create consumer_connections table for electricity meter Consumer IDs
CREATE TABLE IF NOT EXISTS consumer_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consumer_id TEXT NOT NULL,
  connection_name TEXT, -- Optional nickname for the connection
  electricity_board TEXT,
  address TEXT,
  connection_type TEXT DEFAULT 'domestic' CHECK (connection_type IN ('domestic', 'commercial', 'industrial')),
  sanctioned_load DECIMAL(8, 2), -- in kW
  phase_type TEXT DEFAULT 'single' CHECK (phase_type IN ('single', 'three')),
  is_primary BOOLEAN DEFAULT FALSE, -- Mark one connection as primary
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for consumer_connections
ALTER TABLE consumer_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for consumer_connections
CREATE POLICY "Users can view own consumer connections" ON consumer_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumer connections" ON consumer_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consumer connections" ON consumer_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consumer connections" ON consumer_connections FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS consumer_connections_user_id_idx ON consumer_connections(user_id);
CREATE INDEX IF NOT EXISTS consumer_connections_consumer_id_idx ON consumer_connections(consumer_id);
CREATE INDEX IF NOT EXISTS consumer_connections_is_primary_idx ON consumer_connections(is_primary);

-- Create trigger for updated_at
CREATE TRIGGER update_consumer_connections_updated_at 
  BEFORE UPDATE ON consumer_connections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add consumer_id to profiles table for backward compatibility (optional)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_consumer_id TEXT;

-- Function to ensure only one primary connection per user
CREATE OR REPLACE FUNCTION ensure_single_primary_connection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Set all other connections for this user to non-primary
    UPDATE consumer_connections 
    SET is_primary = FALSE 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one primary connection
CREATE TRIGGER ensure_single_primary_connection_trigger
  BEFORE INSERT OR UPDATE OF is_primary ON consumer_connections
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_connection();
