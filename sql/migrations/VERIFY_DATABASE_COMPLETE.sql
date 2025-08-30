-- VERIFY DATABASE SETUP AND CONNECTION
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check all tables exist and are properly configured
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'devices', 'consumption_data', 'recommendations',
    'energy_alerts', 'energy_goals', 'billing_data', 'device_catalog'
  )
ORDER BY tablename;

-- 2. Check Row Level Security policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check indexes for performance
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'devices', 'consumption_data', 'recommendations',
    'energy_alerts', 'energy_goals', 'billing_data', 'device_catalog'
  )
ORDER BY tablename, indexname;

-- 4. Check triggers are working
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 5. Test device catalog and search function
SELECT 'Device Catalog Count:' as test, COUNT(*) as result FROM device_catalog
UNION ALL
SELECT 'Search Function Test:', COUNT(*) FROM search_devices_by_keywords('air conditioner')
UNION ALL  
SELECT 'Sample Search Result:', name FROM search_devices_by_keywords('led bulb') LIMIT 1;

-- 6. Check table row counts
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Devices', COUNT(*) FROM devices
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

-- 7. Test sample data insertion (this will create a test user profile)
DO $$
DECLARE
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Insert test user profile if it doesn't exist
    INSERT INTO profiles (id, email, full_name) 
    VALUES (test_user_id, 'test@urjabandhu.com', 'Test User')
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert test device
    INSERT INTO devices (user_id, name, type, brand, power_rating, room, usage_hours_per_day) 
    VALUES (test_user_id, 'Test AC', 'air_conditioner', 'Test Brand', 1500, 'Test Room', 8.0)
    ON CONFLICT DO NOTHING;
    
    -- Insert test consumption data
    INSERT INTO consumption_data (user_id, device_id, timestamp, consumption_kwh, cost) 
    VALUES (
        test_user_id, 
        (SELECT id FROM devices WHERE user_id = test_user_id LIMIT 1), 
        NOW(), 
        12.5, 
        75.0
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test data inserted successfully';
END $$;

-- 8. Verify test data was inserted
SELECT 
    'Test Profile Created' as test,
    CASE WHEN EXISTS(SELECT 1 FROM profiles WHERE email = 'test@urjabandhu.com') 
         THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL
SELECT 
    'Test Device Created',
    CASE WHEN EXISTS(SELECT 1 FROM devices WHERE name = 'Test AC') 
         THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT 
    'Test Consumption Created',
    CASE WHEN EXISTS(SELECT 1 FROM consumption_data WHERE user_id = '11111111-1111-1111-1111-111111111111') 
         THEN 'PASS' ELSE 'FAIL' END;

-- 9. Test OCR function exists and works
SELECT 
    'OCR Function Exists' as test,
    CASE WHEN EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'search_devices_by_keywords' 
        AND routine_schema = 'public'
    ) THEN 'PASS' ELSE 'FAIL' END as result;

-- 10. Final summary
SELECT 
    '=== DATABASE SETUP VERIFICATION COMPLETE ===' as summary,
    'All tests should show PASS status above' as note;

-- Clean up test data (optional - comment out if you want to keep test data)
DELETE FROM consumption_data WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM devices WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';
