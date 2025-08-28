-- Test Device Catalog Setup
-- Run these queries in your Supabase SQL Editor to verify the setup

-- 1. Check if device_catalog table exists and has data
SELECT COUNT(*) as total_devices FROM device_catalog;

-- 2. Test device search function with common OCR text
SELECT * FROM search_devices_by_keywords('air conditioner split');

-- 3. Test with lighting keywords
SELECT * FROM search_devices_by_keywords('led bulb 12w');

-- 4. Test with kitchen appliance
SELECT * FROM search_devices_by_keywords('microwave oven');

-- 5. View all categories available
SELECT DISTINCT category, COUNT(*) as device_count 
FROM device_catalog 
GROUP BY category 
ORDER BY category;

-- 6. Test partial keyword matching
SELECT * FROM search_devices_by_keywords('tv led 43');
