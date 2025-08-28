-- Run this SQL in your Supabase Dashboard SQL Editor
-- This will fix the profiles table to support the settings page

-- First, check if the columns already exist and add them if they don't
DO $$
BEGIN
    -- Add notification_preferences column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE profiles 
        ADD COLUMN notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_notifications": true, "energy_tips": true, "weekly_reports": true}';
    END IF;

    -- Add theme column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'theme') THEN
        ALTER TABLE profiles 
        ADD COLUMN theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'));
    END IF;

    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'language') THEN
        ALTER TABLE profiles 
        ADD COLUMN language TEXT DEFAULT 'en';
    END IF;

    -- Add timezone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE profiles 
        ADD COLUMN timezone TEXT DEFAULT 'Asia/Kolkata';
    END IF;

    -- Add energy_rate column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'energy_rate') THEN
        ALTER TABLE profiles 
        ADD COLUMN energy_rate DECIMAL(10, 2) DEFAULT 8.00;
    END IF;

    -- Add currency column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'currency') THEN
        ALTER TABLE profiles 
        ADD COLUMN currency TEXT DEFAULT 'INR';
    END IF;
END $$;

-- Update existing profiles with default values for any NULL columns
UPDATE profiles 
SET 
    notification_preferences = COALESCE(notification_preferences, '{"email_alerts": true, "push_notifications": true, "energy_tips": true, "weekly_reports": true}'),
    theme = COALESCE(theme, 'system'),
    language = COALESCE(language, 'en'),
    timezone = COALESCE(timezone, 'Asia/Kolkata'),
    energy_rate = COALESCE(energy_rate, 8.00),
    currency = COALESCE(currency, 'INR'),
    updated_at = NOW()
WHERE notification_preferences IS NULL 
   OR theme IS NULL 
   OR language IS NULL 
   OR timezone IS NULL 
   OR energy_rate IS NULL 
   OR currency IS NULL;

-- Show the updated table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
