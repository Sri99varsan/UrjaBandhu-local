-- Quick Database Verification Script
-- Run this in Supabase SQL Editor AFTER deploying device-catalog.sql

-- 1. Check if device_catalog table exists and has data
SELECT 
  COUNT(*) as total_devices,
  COUNT(DISTINCT category) as categories_count,
  AVG(power_rating_avg) as avg_power_rating
FROM device_catalog;

-- 2. Check if search function exists
SELECT 
  proname as function_name,
  prosrc as function_exists
FROM pg_proc 
WHERE proname = 'search_devices_by_keywords';

-- 3. Test search function with sample queries
SELECT 'Testing Samsung TV search' as test_name;
SELECT * FROM search_devices_by_keywords('Samsung LED TV') LIMIT 3;

SELECT 'Testing AC search' as test_name;
SELECT * FROM search_devices_by_keywords('Air Conditioner 1.5 Ton') LIMIT 3;

SELECT 'Testing Fan search' as test_name;
SELECT * FROM search_devices_by_keywords('Ceiling Fan') LIMIT 3;

-- 4. Show device categories
SELECT 
  category,
  COUNT(*) as device_count,
  AVG(power_rating_avg) as avg_power
FROM device_catalog 
GROUP BY category 
ORDER BY device_count DESC;

-- Expected Results:
-- 1. total_devices should be ~80
-- 2. function_exists should show function code
-- 3. Each search should return 3-5 relevant devices
-- 4. Categories: cooling, appliance, lighting, entertainment, etc.
