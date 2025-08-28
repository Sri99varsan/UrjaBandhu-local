import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface TestResult {
  name: string
  status: string
  error?: string | null
}

export async function GET() {
  try {
    // Test basic connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const diagnostics = {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      serviceRoleKey: serviceRoleKey ? 'Set' : 'Missing',
      anonKey: anonKey ? 'Set' : 'Missing',
      functionUrl: `${supabaseUrl}/functions/v1/ocr-device-detection`,
      tests: [] as TestResult[]
    }

    // Test 1: Basic Supabase connection with anon key
    try {
      const supabaseAnon = createClient(supabaseUrl!, anonKey!)
      const { data: testData, error: testError } = await supabaseAnon
        .from('profiles')
        .select('count')
        .limit(1)
      
      diagnostics.tests.push({
        name: 'Anon key connection',
        status: testError ? 'Failed' : 'Passed',
        error: testError?.message
      })
    } catch (error) {
      diagnostics.tests.push({
        name: 'Anon key connection',
        status: 'Failed',
        error: (error as Error).message
      })
    }

    // Test 2: Service role connection
    if (serviceRoleKey) {
      try {
        const supabaseService = createClient(supabaseUrl!, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
        
        const { data: testData, error: testError } = await supabaseService
          .from('device_catalog')
          .select('count')
          .limit(1)
        
        diagnostics.tests.push({
          name: 'Service role connection',
          status: testError ? 'Failed' : 'Passed',
          error: testError?.message
        })
      } catch (error) {
        diagnostics.tests.push({
          name: 'Service role connection',
          status: 'Failed',
          error: (error as Error).message
        })
      }
    }

    // Test 3: Edge Function connection
    if (serviceRoleKey) {
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/ocr-device-detection`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            },
            body: JSON.stringify({
              image_url: 'test',
              user_id: 'test'
            })
          }
        )

        diagnostics.tests.push({
          name: 'Edge Function test',
          status: response.ok ? 'Passed' : 'Failed',
          error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
        })
      } catch (error) {
        diagnostics.tests.push({
          name: 'Edge Function test',
          status: 'Failed',
          error: (error as Error).message
        })
      }
    }

    return NextResponse.json(diagnostics)

  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}
