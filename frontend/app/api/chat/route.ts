import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAndUpcomingFestivals, generateFestivalPrompt, getTodaysEnergyTip } from '@/lib/festivals/festival-utils'

// Smart mockup response generator
function generateSmartMockupResponse(message: string): string {
  // Check for festival-related queries
  if (message.includes('festival') || message.includes('diwali') || message.includes('holi') || message.includes('christmas') || message.includes('ganesh') || message.includes('durga')) {
    const festivalSuggestions = getCurrentAndUpcomingFestivals()

    if (festivalSuggestions.length > 0) {
      return generateFestivalPrompt()
    } else {
      return `🎉 **Festival Energy Tips**

I can help you celebrate festivals in an energy-efficient way! Here are some general festival energy-saving tips:

• **🪔 LED Decorations**: Use LED lights and diyas instead of traditional bulbs - save 70-90% energy
• **⏰ Smart Timers**: Install timers for decorative lights to avoid wastage
• **❄️ Efficient Cooling**: Use fans with AC during celebrations to maintain comfort efficiently
• **🔥 Safety First**: Always check electrical connections before festival setups

**Popular Festival Tips Available:**
• Diwali energy-efficient lighting
• Christmas decoration savings
• Holi water-safe electrical tips
• Wedding celebration energy optimization

Which festival would you like specific energy-saving advice for? 🌟`
    }
  }

  // Greetings and welcome
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('namaste')) {
    // Check if there are any current festivals to mention
    const festivalSuggestions = getCurrentAndUpcomingFestivals()
    const todaysEnergyTip = getTodaysEnergyTip()

    let greeting = "🙏 Namaste! I'm UrjaBandhu, your personal energy advisor. I'm here to help you save money on your electricity bills and reduce your carbon footprint."

    // Add festival greeting if there's an upcoming festival
    if (festivalSuggestions.length > 0) {
      const nearestFestival = festivalSuggestions[0]
      if (nearestFestival.daysUntil <= 7) {
        if (nearestFestival.daysUntil <= 0) {
          greeting += `\n\n🎉 **Happy ${nearestFestival.festival.name}!** I have special energy-saving tips for your celebration today.`
        } else {
          greeting += `\n\n🎊 **${nearestFestival.festival.name} is coming up in ${nearestFestival.daysUntil} days!** I can share energy-efficient celebration tips.`
        }
      }
    }

    // Add today's special energy tip if available
    if (todaysEnergyTip) {
      greeting += `\n\n${todaysEnergyTip}`
    }

    greeting += "\n\nHow can I assist you with your energy concerns today?"

    return greeting
  }

  // Bill analysis
  if (message.includes('bill') || message.includes('cost') || message.includes('expensive') || message.includes('high bill')) {
    return "💡 High electricity bills can be frustrating! Here are some quick ways to reduce your costs:\n\n• **Switch to LED bulbs** - Save ₹1,500-2,500 annually\n• **Use AC efficiently** - Set temperature to 24°C, save 20-30%\n• **Unplug devices** when not in use - Reduce phantom load by 10%\n• **Use fans with AC** - Feel 3°C cooler, use less AC\n\nWould you like me to analyze your specific bill or suggest appliance-specific savings?";
  }

  // AC and cooling
  if (message.includes('ac') || message.includes('air conditioner') || message.includes('cooling') || message.includes('summer')) {
    return "❄️ **Smart AC Usage Tips:**\n\n• **Optimal temperature**: 24-26°C saves 20-30% energy\n• **5-star rated AC**: Consumes 30% less electricity\n• **Regular maintenance**: Clean filters monthly, save 15%\n• **Use timer function**: Auto-off saves ₹500-800/month\n• **Ceiling fans**: Use with AC, feel cooler at higher temps\n\n💰 **Savings**: A 1.5-ton AC can save ₹2,000-4,000 annually with these tips!\n\nNeed help calculating your AC's power consumption?";
  }

  // Appliances and devices
  if (message.includes('appliance') || message.includes('device') || message.includes('fridge') || message.includes('refrigerator')) {
    return "🏠 **Energy-Efficient Appliance Guide:**\n\n**Refrigerator** (₹3,000-5,000/year)\n• 5-star rating saves 40% energy\n• Maintain 4°C (fridge) and -15°C (freezer)\n• Don't overpack, clean coils monthly\n\n**Water Heater** (₹2,000-4,000/year)\n• Use timer, heat only when needed\n• Insulate pipes, save 10-15%\n• Solar heater saves 70-80% costs\n\n**TV & Electronics**\n• Switch to LED TV, save 50% energy\n• Use power strips, cut standby power\n\nWhich appliance would you like specific advice for?";
  }

  // LED and lighting
  if (message.includes('led') || message.includes('light') || message.includes('bulb') || message.includes('lighting')) {
    return `## 💡 LED Lighting Savings Calculator

### Comparison: Traditional vs LED Bulbs

| Type | Wattage | Daily Cost (5hrs) | Monthly Savings |
|------|---------|------------------|----------------|
| **Traditional Bulb** | 60W | ₹10 | - |
| **LED Bulb** | 9W | ₹1.5 | **₹255** |

### For a Typical Home (10 bulbs):
- **Total annual savings**: **₹30,600**
- **LED investment**: ₹2,000-3,000
- **Payback period**: 1-2 months! �

> **Pro tip**: Replace high-usage bulbs first (living room, kitchen) for maximum impact.

**How many bulbs do you want to replace?**`;
  }

  // Solar and renewable energy
  if (message.includes('solar') || message.includes('renewable') || message.includes('panels')) {
    return "☀️ **Solar Power Benefits for Your Home:**\n\n**Cost Analysis (3kW system):**\n• Installation: ₹1.8-2.5 lakhs\n• Monthly savings: ₹2,500-4,000\n• Government subsidy: Up to ₹78,000\n• Payback period: 5-7 years\n• 25-year savings: ₹8-12 lakhs\n\n**Environmental Impact:**\n• Reduce 3-4 tons CO2 annually\n• Equivalent to planting 100+ trees\n\n**Best for:** South-facing roofs, minimal shading\n\nWould you like help calculating solar potential for your specific roof area?";
  }

  // Energy monitoring and smart home
  if (message.includes('monitor') || message.includes('track') || message.includes('smart') || message.includes('meter')) {
    return "📊 **Smart Energy Monitoring Solutions:**\n\n**Smart Meters:**\n• Real-time consumption tracking\n• Identify energy-hungry devices\n• Time-of-use billing optimization\n\n**Smart Plugs (₹500-1,500 each):**\n• Remote control appliances\n• Track individual device consumption\n• Schedule automatic on/off\n\n**Home Energy Management:**\n• Peak vs off-peak usage optimization\n• Automated load management\n• 15-25% additional savings possible\n\n**UrjaBandhu Features:**\n• Bill analysis and predictions\n• Personalized saving recommendations\n• Device-wise consumption breakdown\n\nInterested in setting up smart monitoring for your home?";
  }

  // Tips and general advice
  if (message.includes('tip') || message.includes('advice') || message.includes('save') || message.includes('reduce')) {
    return `# 🎯 Top Energy-Saving Tips for Indian Homes

## ⚡ Immediate Actions (Zero Cost)
- **Unplug chargers & devices**: Save ₹200-400/month
- **Use natural light during day**: Save ₹300-500/month  
- **Air-dry clothes instead of dryer**: Save ₹800-1,200/month

## 💰 Low-Cost Upgrades (₹1,000-5,000)
1. **LED bulbs**: Save ₹2,500-4,000/year
2. **Power strips with switches**: Save ₹500-800/year
3. **Window films for AC rooms**: Save ₹1,000-2,000/year

## 🏆 Best Investment (₹10,000-50,000)
- **5-star appliances**: Save 30-40% on specific devices
- **Solar water heater**: Save ₹8,000-15,000/year

---

> **Which category interests you most?** I can provide detailed guidance for any of these options! 💡`;
  }

  // Specific numbers and calculations
  if (message.includes('calculate') || message.includes('how much') || message.includes('savings') || message.includes('consumption')) {
    return `## 🧮 Energy Calculation Helper

I can help you calculate:

### Power Consumption Formula:
\`\`\`
Power Consumption = Device Wattage × Hours Used × Days × Rate per kWh
\`\`\`

**Example Calculation:**
\`1500W AC × 8hrs × 30 days = 360 units = ₹2,160-2,880\`

### Available Calculators:
1. **Potential Savings**
   - Current vs efficient appliance comparison
   - LED vs traditional lighting savings  
   - AC optimization savings

2. **Solar ROI Calculator**
   - Investment vs monthly savings
   - Payback period analysis
   - 25-year financial benefits

### To Calculate for You, Provide:
- ⚡ Appliance type and wattage
- ⏰ Daily usage hours  
- 💰 Current electricity rate (₹/unit)

**What would you like me to calculate?**`;
  }

  // Environmental impact
  if (message.includes('environment') || message.includes('carbon') || message.includes('green') || message.includes('eco')) {
    return "🌱 **Environmental Impact of Energy Savings:**\n\n**Your Carbon Footprint Reduction:**\n• Switching to LEDs: 200kg CO2/year saved\n• Efficient AC usage: 500-800kg CO2/year saved\n• Solar 3kW system: 3,000-4,000kg CO2/year saved\n\n**Equivalent Environmental Benefits:**\n• 1,000 kWh saved = 50+ trees planted\n• Efficient home = 1 car off road for 3 months\n• Solar installation = 10,000+ km less driving annually\n\n**India's Energy Goals:**\n• 500GW renewable by 2030\n• Your contribution matters!\n• Every 1% efficiency improvement = ₹2,000 crores national saving\n\n🌍 **Make a difference**: Small changes in your home contribute to India's green future!\n\nWant to calculate your specific environmental impact?";
  }

  // Government schemes and policies
  if (message.includes('government') || message.includes('subsidy') || message.includes('scheme') || message.includes('policy')) {
    return "🏛️ **Government Energy Schemes & Subsidies:**\n\n**Solar Rooftop Subsidy:**\n• Up to 3kW: 40% central subsidy\n• 3-10kW: 20% central subsidy\n• Additional state subsidies available\n\n**Energy Efficient Appliances:**\n• LED distribution schemes\n• Star rating awareness programs\n• Replacement drives for old appliances\n\n**Net Metering Benefits:**\n• Sell excess solar power to grid\n• Bi-directional metering\n• Credit adjustments in bills\n\n**Time-of-Use Tariffs:**\n• Lower rates during off-peak hours\n• Optimize usage timing\n• Up to 30% bill reduction possible\n\nWhich scheme would you like detailed information about?";
  }

  // Electricity boards and regional info
  if (message.includes('mseb') || message.includes('kseb') || message.includes('electricity board') || message.includes('tariff')) {
    return "⚡ **Regional Electricity Board Information:**\n\n**Common Tariff Patterns in India:**\n• Domestic: ₹3-8/unit (slab-wise pricing)\n• Off-peak hours: Often 20-30% cheaper\n• Peak hours: 20-50% more expensive\n\n**Time-of-Use Optimization:**\n• Run heavy appliances during off-peak\n• Use washing machine, dishwasher at night\n• Charge electric vehicles overnight\n\n**Popular Boards:**\n• **MSEB (Maharashtra)**: Time-of-use available\n• **KSEB (Kerala)**: Special solar tariffs\n• **TNEB (Tamil Nadu)**: Free units for efficient users\n• **BESCOM (Karnataka)**: Net metering friendly\n\nWhich electricity board area are you in? I can provide specific optimization tips!";
  }

  // Default helpful response
  return "🌟 **Welcome to UrjaBandhu - Your Energy Saving Companion!**\n\nI'm here to help you:\n\n• 💰 **Reduce electricity bills** by 20-40%\n• 🏠 **Optimize home appliances** for efficiency\n• ☀️ **Explore solar and renewable options**\n• 📊 **Analyze and track energy consumption**\n• 🌱 **Reduce environmental impact**\n• 💡 **Get personalized energy-saving tips**\n\n**Popular topics to ask about:**\n• \"How to reduce my AC bills?\"\n• \"LED bulb savings calculator\"\n• \"Solar panel cost and benefits\"\n• \"Energy-efficient appliance recommendations\"\n• \"Bill analysis and optimization tips\"\n\nWhat specific energy challenge can I help you solve today? 😊";
}

export async function POST(request: NextRequest) {
  console.log('🚀 Chat API called - Using Mockup Responses');
  try {
    const { message } = await request.json()
    console.log('📨 Received message:', message);

    if (!message || typeof message !== 'string') {
      console.log('❌ No message provided');
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('💬 Processing message:', message.substring(0, 50) + '...');

    // Generate smart mockup response based on user input
    const response = generateSmartMockupResponse(message.toLowerCase());

    console.log('✅ Returning mockup response');
    return NextResponse.json({
      response: response,
      timestamp: new Date().toISOString(),
      source: 'mockup-smart-responses',
      model: 'urjabandhu-mockup-v1'
    });

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

