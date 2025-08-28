import { createClient } from '@supabase/supabase-js'

// Test Supabase connection and table structure
async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygjdvufbiobntseveoia.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnamR2dWZiaW9ibnRzZXZlb2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzA3MTgsImV4cCI6MjA3MTk0NjcxOH0.BQGNl13CD_SkpBAkQ4ByiQilfAW-Wj7XpVzin2UNBls'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 50) + '...')
  
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...')
    const { data: healthData, error: healthError } = await supabase
      .from('_health')
      .select('*')
      .limit(1)
    
    if (healthError) {
      console.log('Health check error (this is normal):', healthError.message)
    }
    
    // Test devices table
    console.log('\n📱 Testing devices table...')
    const { data: devicesData, error: devicesError, count } = await supabase
      .from('devices')
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (devicesError) {
      console.error('❌ Devices table error:', devicesError)
      console.error('Error details:', JSON.stringify(devicesError, null, 2))
    } else {
      console.log('✅ Devices table accessible')
      console.log('Total devices count:', count)
      console.log('Sample data:', devicesData)
    }
    
    // Test consumption_data table
    console.log('\n📊 Testing consumption_data table...')
    const { data: consumptionData, error: consumptionError, count: consumptionCount } = await supabase
      .from('consumption_data')
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (consumptionError) {
      console.error('❌ Consumption_data table error:', consumptionError)
      console.error('Error details:', JSON.stringify(consumptionError, null, 2))
    } else {
      console.log('✅ Consumption_data table accessible')
      console.log('Total consumption records count:', consumptionCount)
      console.log('Sample data:', consumptionData)
    }
    
    // Test user authentication
    console.log('\n👤 Testing user authentication...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ User auth error:', userError)
    } else if (user) {
      console.log('✅ User authenticated:', user.id)
      console.log('Email:', user.email)
      
      // Test user-specific data
      console.log('\n🔒 Testing user-specific data access...')
      const { data: userDevices, error: userDevicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
      
      if (userDevicesError) {
        console.error('❌ User devices error:', userDevicesError)
      } else {
        console.log('✅ User devices accessible, count:', userDevices?.length || 0)
        console.log('User devices:', userDevices)
      }
    } else {
      console.log('ℹ️ No user currently authenticated')
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

// Run the test
testSupabaseConnection().then(() => {
  console.log('\n🏁 Test completed')
}).catch(error => {
  console.error('❌ Test script error:', error)
})
