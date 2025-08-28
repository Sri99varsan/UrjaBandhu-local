import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceDetectionResult {
  detected_text: string
  confidence: number
  device_matches: Array<{
    id: string
    name: string
    category: string
    power_rating: number
    match_confidence: number
  }>
}

// Enhanced OCR simulation function (in production, use Tesseract.js or Google Vision API)
async function extractTextFromImage(imageUrl: string): Promise<{ text: string; confidence: number }> {
  try {
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    // For now, we'll simulate OCR with common device keywords
    // In production, integrate with:
    // - Tesseract.js: https://tesseract.projectnaptha.com/
    // - Google Vision API: https://cloud.google.com/vision
    // - Azure Computer Vision: https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/
    
    const simulatedTexts = [
      "Samsung LED TV 43 inch Smart TV Full HD",
      "LG Split AC 1.5 Ton 5 Star Inverter",
      "Whirlpool Double Door Refrigerator 265L 3 Star",
      "Philips LED Bulb 12W Cool Daylight",
      "IFB Microwave Oven 23L Convection",
      "Bajaj Ceiling Fan 48 inch High Speed",
      "Havells Water Heater 15L Storage",
      "Voltas Window AC 1 Ton 3 Star",
      "Panasonic Washing Machine 6.5kg Top Load",
      "Crompton Table Fan 400mm High Speed",
      "Godrej Single Door Refrigerator 196L",
      "Blue Star Split AC 2 Ton Inverter",
      "Orient Ceiling Fan 1200mm",
      "Bosch Dishwasher 12 Place Settings",
      "V-Guard Water Heater 25L"
    ]
    
    // Simulate random selection for demo
    const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)]
    
    return {
      text: randomText,
      confidence: 0.75 + Math.random() * 0.2 // Random confidence between 0.75-0.95
    }
  } catch (error) {
    console.error('OCR Error:', error)
    return {
      text: "",
      confidence: 0
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse the request
    const { image_url, user_id } = await req.json()

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract text from image using OCR
    const ocrResult = await extractTextFromImage(image_url)
    
    if (!ocrResult.text || ocrResult.confidence < 0.5) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not detect readable text from image',
          detected_text: ocrResult.text,
          confidence: ocrResult.confidence
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Search for matching devices in the catalog
    const { data: deviceMatches, error: searchError } = await supabase
      .rpc('search_devices_by_keywords', { search_text: ocrResult.text })

    if (searchError) {
      console.error('Device search error:', searchError)
      return new Response(
        JSON.stringify({ error: 'Failed to search device catalog' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format the response
    const result: DeviceDetectionResult = {
      detected_text: ocrResult.text,
      confidence: ocrResult.confidence,
      device_matches: (deviceMatches || []).map((device: any) => ({
        id: device.id,
        name: device.name,
        category: device.category,
        power_rating: device.power_rating_avg,
        match_confidence: device.confidence
      }))
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
