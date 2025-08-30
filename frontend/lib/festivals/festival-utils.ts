export interface Festival {
    name: string
    date: string
    type: 'major' | 'regional' | 'seasonal'
    energyTips: string[]
    safetyMeasures: string[]
}

export interface FestivalSuggestion {
    festival: Festival
    daysUntil: number
    urgency: 'immediate' | 'upcoming' | 'preparation'
}

// Festival data with energy and safety tips
export const festivals: Festival[] = [
    {
        name: 'Diwali',
        date: '2025-11-01',
        type: 'major',
        energyTips: [
            'Use LED diyas instead of traditional oil lamps - save 70% energy',
            'Switch to LED string lights - consume 90% less electricity',
            'Set timer controls for decorative lights to avoid wastage',
            'Use warm white LEDs to maintain traditional ambiance',
            'Consider solar-powered decorative lights for outdoor displays'
        ],
        safetyMeasures: [
            'Check all electrical connections before installing lights',
            'Keep fire extinguishers accessible when using candles',
            'Avoid overloading electrical circuits with decorations',
            'Turn off all decorative lights when leaving home',
            'Keep electrical decorations away from water sources'
        ]
    },
    {
        name: 'Holi',
        date: '2025-03-14',
        type: 'major',
        energyTips: [
            'Use solar water heaters for warm water baths',
            'Prepare organic colors to save processing energy',
            'Use buckets instead of running water for celebrations',
            'Organize community celebrations to share energy costs'
        ],
        safetyMeasures: [
            'Use natural, non-toxic colors only',
            'Protect electrical appliances from water damage',
            'Keep first aid kit accessible during celebrations',
            'Avoid playing with colors near electrical outlets'
        ]
    },
    {
        name: 'Karva Chauth',
        date: '2025-11-05',
        type: 'major',
        energyTips: [
            'Use LED decorative lights for evening ceremonies',
            'Cook in batches to optimize energy usage',
            'Use efficient appliances for food preparation'
        ],
        safetyMeasures: [
            'Handle traditional lamps with care',
            'Ensure proper ventilation during cooking',
            'Keep hydration supplies nearby during fasting'
        ]
    },
    {
        name: 'Dussehra',
        date: '2025-10-12',
        type: 'major',
        energyTips: [
            'Use energy-efficient lighting for pandals',
            'Organize community events to share electricity costs',
            'Use public transportation to reach celebrations'
        ],
        safetyMeasures: [
            'Maintain safe distance from fireworks displays',
            'Keep emergency contacts handy during large gatherings',
            'Follow crowd safety guidelines at events'
        ]
    }
]

export function getCurrentAndUpcomingFestivals(): FestivalSuggestion[] {
    const today = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(today.getMonth() + 1)

    return festivals.map(festival => {
        const festivalDate = new Date(festival.date)
        const timeDiff = festivalDate.getTime() - today.getTime()
        const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24))

        let urgency: 'immediate' | 'upcoming' | 'preparation' = 'preparation'
        if (daysUntil <= 0) urgency = 'immediate'
        else if (daysUntil <= 7) urgency = 'upcoming'

        return {
            festival,
            daysUntil,
            urgency
        }
    }).filter(item => item.daysUntil >= 0 && item.daysUntil <= 30)
}

export function generateFestivalPrompt(): string {
    const upcomingFestivals = getCurrentAndUpcomingFestivals()

    if (upcomingFestivals.length === 0) {
        return "Welcome to UrjaBandhu! I'm here to help you save energy and stay safe during festivals. Ask me about energy-saving tips!"
    }

    const nextFestival = upcomingFestivals[0]
    const { festival, daysUntil, urgency } = nextFestival

    if (urgency === 'immediate') {
        return `Happy ${festival.name}! Here are some energy-saving tips for today's celebration: ${festival.energyTips[0]}`
    } else if (urgency === 'upcoming') {
        return `${festival.name} is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}! Get ready with these energy tips: ${festival.energyTips[0]}`
    } else {
        return `${festival.name} is coming up in ${daysUntil} days! Start planning your energy-efficient celebrations.`
    }
}

export function getTodaysEnergyTip(): string {
    const tips = [
        "Switch off lights when not in use - save up to 15% on your electricity bill",
        "Use LED bulbs - they consume 80% less energy than traditional bulbs",
        "Unplug electronics when not in use to avoid phantom energy consumption",
        "Use natural light during the day instead of artificial lighting",
        "Set your AC to 24°C for optimal energy efficiency"
    ]

    const today = new Date()
    const tipIndex = today.getDate() % tips.length
    return tips[tipIndex]
}

export function getFestivalTips(festivalName: string): { energyTips: string[], safetyMeasures: string[] } | null {
    const festival = festivals.find(f => f.name.toLowerCase() === festivalName.toLowerCase())
    if (!festival) return null

    return {
        energyTips: festival.energyTips,
        safetyMeasures: festival.safetyMeasures
    }
}