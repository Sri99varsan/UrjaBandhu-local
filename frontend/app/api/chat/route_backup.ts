import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Function to create Google Gemini client
function createGeminiClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  console.log('🔑 Checking API key:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'Not found');

  if (!apiKey || apiKey === 'your-actual-gemini-api-key-here') {
    console.warn('❌ Google Gemini API key not configured properly');
    return null;
  }

  try {
    console.log('✨ Creating Google Gemini client...');
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('💥 Error creating Gemini client:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Chat API called');

  try {
    console.log('📥 Parsing request body...');
    const { message, context } = await request.json()
    console.log('📝 Received message:', message);

    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message format');
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // For now, return a test response to verify basic functionality
    console.log('✅ Returning test response');
    return NextResponse.json({
      response: `Test response for: "${message}". The server is working! Now testing Gemini integration...`,
      timestamp: new Date().toISOString(),
      source: 'test-mode',
      model: 'test'
    });

    // Create Gemini client (commented out for testing)
    /*
    console.log('🤖 Creating Gemini client...');
    const genAI = createGeminiClient()

    if (!genAI) {
      console.warn('⚠️ No AI service configured, falling back to mock responses');
      return NextResponse.json({
        response: generateFallbackResponse(message.toLowerCase()),
        timestamp: new Date().toISOString(),
        source: 'fallback'
      })
    }

    try {
      // Create the system prompt for energy domain expertise
      const systemPrompt = `You are UrjaBandhu AI, an expert energy consultant specializing in Indian electricity consumption and optimization. 

Your expertise includes:
- Electricity bill analysis and cost optimization
- Appliance energy efficiency recommendations
- Peak/off-peak hour strategies for Indian electricity boards
- Solar panel and renewable energy advice for Indian homes
- Environmental impact calculations
- Smart home automation for energy savings
- Regional electricity tariff optimization

User Context: ${context ? JSON.stringify(context) : 'New user, no previous data'}

Guidelines:
- Always provide practical, actionable advice
- Use Indian rupees (₹) for cost calculations
- Reference common Indian appliances and usage patterns
- Mention relevant Indian electricity boards when applicable
- Keep responses concise but informative
- Offer specific numbers and percentages when possible
- Be encouraging about energy conservation efforts

Respond in a friendly, helpful tone as if you're a personal energy advisor.

User Query: ${message}`;

      // Get the Gemini Pro model for better responses
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      console.log('🔄 Making API call with Gemini model: gemini-1.5-pro');
      console.log('📤 Sending prompt to Gemini...');

      // Generate content using Gemini Pro
      const result = await model.generateContent(systemPrompt);

      console.log('📥 Received result from Gemini API');

      if (!result || !result.response) {
        throw new Error('No response received from Gemini API');
      }

      const response = await result.response;
      const aiResponse = response.text();

      if (!aiResponse || aiResponse.trim() === '') {
        throw new Error('Empty response from Gemini API');
      }

      console.log('✅ Successfully processed Gemini response');
      console.log('📊 Response length:', aiResponse.length, 'characters');

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        source: 'google-gemini-pro',
        model: 'gemini-1.5-pro',
        usage: {
          model: 'gemini-1.5-pro',
          prompt_tokens: systemPrompt.length,
          completion_tokens: aiResponse.length
        }
      });

    } catch (aiError: any) {
      console.error('💥 Gemini API error details:', {
        message: aiError?.message || 'Unknown error',
        stack: aiError?.stack || 'No stack trace',
        name: aiError?.name || 'Unknown error type',
        code: aiError?.code || 'No error code'
      });

      // Fallback to mock responses if AI fails
      return NextResponse.json({
        response: generateFallbackResponse(message.toLowerCase()),
        timestamp: new Date().toISOString(),
        source: 'fallback-after-error',
        model: 'fallback',
        error: `AI service temporarily unavailable: ${aiError?.message || 'Unknown error'}`
      });
    }
    */

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateFallbackResponse(message: string): string {
  // Energy-related keywords and responses
  const responses = {
    // Usage and consumption
    usage: [
      "Based on your current patterns, your daily consumption is averaging 2.4 kWh. This is within normal range for a household of your size.",
      "Your electricity usage shows peak consumption during evening hours (6-9 PM). Consider shifting some appliances to off-peak hours to save costs.",
      "I've analyzed your usage trends - you're consuming 12% less than last month, which is excellent progress!"
    ],

    // Cost and savings
    cost: [
      "Your current electricity bill is projected at ₹380 for this month. I can suggest ways to reduce this by 15-20%.",
      "Energy costs can be reduced by optimizing high-consumption appliances. Your AC and water heater account for 60% of your bill.",
      "Based on your usage patterns, switching to time-of-use pricing could save you ₹50-80 per month."
    ],

    // Savings and tips
    save: [
      "Here are 3 immediate ways to save: 1) Set AC to 24°C instead of 22°C (saves 15%), 2) Use LED bulbs (70% less energy), 3) Unplug devices when not in use.",
      "Your biggest saving opportunity is your water heater - using a timer can reduce consumption by 25%. Would you like me to set up an automation rule?",
      "I recommend these energy-saving strategies: optimize your refrigerator settings, use natural light during day, and consider solar water heating."
    ],

    // Appliances
    appliance: [
      "Your air conditioner is your highest energy consumer at 1.2 kWh daily. Running it for 6 hours instead of 8 could save ₹600 annually.",
      "I've detected your washing machine usage pattern. Using cold water wash can reduce energy consumption by 40% without affecting cleaning quality.",
      "Your refrigerator is running efficiently, but cleaning the coils quarterly can improve efficiency by 10-15%."
    ],

    // Environmental impact
    environment: [
      "Your current consumption generates approximately 180 kg CO2 monthly. Reducing usage by 20% would save 36 kg CO2 - equivalent to planting 2 trees!",
      "Great environmental consciousness! Your energy choices are contributing to a cleaner planet. Every kWh saved prevents 0.82 kg of CO2 emissions.",
      "Your renewable energy usage through grid-tied solar is excellent. You're offsetting 30% of your carbon footprint!"
    ],

    // Predictions and trends
    predict: [
      "Based on seasonal trends, your energy consumption will likely increase by 25% in summer months due to cooling needs.",
      "Your usage pattern suggests you'll spend approximately ₹4,200 this year on electricity. Installing solar panels could reduce this by 60%.",
      "I predict your next month's consumption will be 68 kWh based on current trends and weather forecasts."
    ],

    // Default responses
    default: [
      "I understand you're asking about energy efficiency. Your current consumption is 2.4 kWh today with spending at ₹127 this month. How can I help you optimize this?",
      "That's an interesting question about your energy usage! Based on your patterns, I can see several optimization opportunities. What specific aspect interests you most?",
      "I'm here to help you understand and optimize your energy consumption. Your current efficiency rating is good, but there's always room for improvement!",
      "Great question! Your energy data shows promising trends. I can provide detailed analysis on consumption patterns, cost optimization, or environmental impact. What would you prefer?"
    ]
  }

  // Check for keywords and return appropriate response
  if (message.includes('usage') || message.includes('consumption') || message.includes('kwh')) {
    return getRandomResponse(responses.usage)
  } else if (message.includes('cost') || message.includes('bill') || message.includes('money') || message.includes('₹')) {
    return getRandomResponse(responses.cost)
  } else if (message.includes('save') || message.includes('reduce') || message.includes('optimize') || message.includes('efficiency')) {
    return getRandomResponse(responses.save)
  } else if (message.includes('appliance') || message.includes('ac') || message.includes('refrigerator') || message.includes('heater')) {
    return getRandomResponse(responses.appliance)
  } else if (message.includes('environment') || message.includes('carbon') || message.includes('co2') || message.includes('green')) {
    return getRandomResponse(responses.environment)
  } else if (message.includes('predict') || message.includes('forecast') || message.includes('future') || message.includes('trend')) {
    return getRandomResponse(responses.predict)
  } else {
    return getRandomResponse(responses.default)
  }
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)]
}
