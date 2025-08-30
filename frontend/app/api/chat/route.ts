import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize Gemini client
let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  console.log('🔑 API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'Not found');
  console.log('🌍 Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));

  if (!apiKey) {
    console.error('❌ Google Gemini API key not found in environment variables');
    throw new Error('Google Gemini API key not configured');
  }

  if (!genAI) {
    console.log('✨ Creating new GoogleGenerativeAI instance...');
    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

// Energy domain specific system prompt
const ENERGY_SYSTEM_PROMPT = `You are UrjaBandhu, an AI energy advisor specialized in helping users understand and optimize their electricity consumption. You provide practical, actionable advice about energy efficiency, cost savings, and environmental impact.

Key responsibilities:
- Analyze energy consumption patterns and provide insights
- Suggest practical energy-saving tips
- Explain electricity bills and cost optimization
- Provide environmental impact information
- Recommend appliance efficiency improvements
- Answer questions about renewable energy options

Guidelines:
- Always use ₹ (Indian Rupees) for cost calculations
- Provide specific, actionable recommendations
- Include approximate savings amounts when possible
- Be helpful, friendly, and encouraging about energy conservation
- Focus on practical solutions suitable for Indian households
- If asked about topics outside energy efficiency, politely redirect to energy-related topics

Please respond in a conversational, helpful manner while staying focused on energy efficiency and consumption optimization.`;

export async function POST(request: NextRequest) {
  console.log('🚀 Chat API called');
  try {
    const { messages } = await request.json()
    console.log('📨 Received messages:', messages?.length || 0);

    if (!messages || messages.length === 0) {
      console.log('❌ No messages provided');
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      console.log('❌ Invalid message format');
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    console.log('💬 Processing message:', lastMessage.content.substring(0, 50) + '...');

    try {
      // Initialize Gemini
      console.log('🤖 Initializing Gemini...');
      const gemini = initializeGemini();

      // Configure the model with safety settings
      const model = gemini.getGenerativeModel({
        model: "gemini-1.5-pro",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      // Prepare the conversation context
      const conversationHistory = messages.map((msg: any) => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return '';
      }).filter(Boolean).join('\n');

      // Create the full prompt
      const fullPrompt = `${ENERGY_SYSTEM_PROMPT}

Previous conversation:
${conversationHistory}

Please respond to the user's latest message as UrjaBandhu, the energy advisor.`;

      console.log('Sending request to Gemini Pro...');

      // Generate content using Gemini
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response generated from Gemini');
      }

      console.log('Gemini Pro response received successfully');

      // Return successful response
      return NextResponse.json({
        response: text,
        timestamp: new Date().toISOString(),
        source: 'gemini-pro',
        model: 'gemini-1.5-pro',
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        }
      });

    } catch (aiError: any) {
      console.error('Gemini API Error:', {
        message: aiError?.message || 'Unknown error',
        status: aiError?.status || 'No status',
        error: aiError
      });

      // Check for specific error types
      if (aiError?.message?.includes('API_KEY_INVALID')) {
        return NextResponse.json({
          error: 'Invalid Gemini API key. Please check your configuration.',
          source: 'gemini-error'
        }, { status: 401 });
      }

      if (aiError?.message?.includes('PERMISSION_DENIED')) {
        return NextResponse.json({
          error: 'Gemini API access denied. Please check your API key permissions.',
          source: 'gemini-error'
        }, { status: 403 });
      }

      if (aiError?.message?.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json({
          error: 'Gemini API quota exceeded. Please try again later.',
          source: 'gemini-error'
        }, { status: 429 });
      }

      // Fallback to mock responses for other errors
      console.log('Falling back to mock response due to Gemini error');
      return NextResponse.json({
        response: generateFallbackResponse(lastMessage.content.toLowerCase()),
        timestamp: new Date().toISOString(),
        source: 'fallback-after-error',
        model: 'fallback',
        error: `Gemini temporarily unavailable: ${aiError?.message || 'Unknown error'}`
      });
    }

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
