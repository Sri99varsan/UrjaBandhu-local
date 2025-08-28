-- Migration: Add missing columns to profiles table for user settings
-- This adds the columns needed for the user settings functionality

-- Add notification preferences as JSONB
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_notifications": true, "energy_tips": true, "weekly_reports": true}';

-- Add theme preference
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'));

-- Add language preference
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Add timezone
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- Add energy rate (per kWh)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS energy_rate DECIMAL(10, 2) DEFAULT 8.00;

-- Add currency
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Update existing profiles with default values if they have NULL in new columns
UPDATE profiles 
SET 
  notification_preferences = COALESCE(notification_preferences, '{"email_alerts": true, "push_notifications": true, "energy_tips": true, "weekly_reports": true}'),
  theme = COALESCE(theme, 'system'),
  language = COALESCE(language, 'en'),
  timezone = COALESCE(timezone, 'Asia/Kolkata'),
  energy_rate = COALESCE(energy_rate, 8.00),
  currency = COALESCE(currency, 'INR')
WHERE notification_preferences IS NULL 
   OR theme IS NULL 
   OR language IS NULL 
   OR timezone IS NULL 
   OR energy_rate IS NULL 
   OR currency IS NULL;
