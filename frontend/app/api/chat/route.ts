import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))

    // Generate contextual responses based on energy-related keywords
    let response = generateEnergyResponse(message.toLowerCase())
    
    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateEnergyResponse(message: string): string {
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
