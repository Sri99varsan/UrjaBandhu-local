// Real-time data pipeline for UrjaBandhu
// Handles InfluxDB integration and data streaming

export interface EnergyDataPoint {
    timestamp: Date
    deviceId: string
    deviceName: string
    consumption: number // in kWh
    voltage: number
    current: number
    power: number // in watts
    cost: number // in rupees
    location?: string
    efficiency?: number
}

export interface RealTimeMetrics {
    totalConsumption: number
    totalCost: number
    activeDevices: number
    peakDemand: number
    averageEfficiency: number
    carbonFootprint: number
}

export class DataPipelineService {
    private influxUrl: string
    private influxToken: string
    private influxOrg: string
    private influxBucket: string
    private isProduction: boolean

    constructor() {
        this.influxUrl = process.env.INFLUXDB_URL || 'http://localhost:8086'
        this.influxToken = process.env.INFLUXDB_TOKEN || 'urjabandhu-token-2024'
        this.influxOrg = process.env.INFLUXDB_ORG || 'urjabandhu'
        this.influxBucket = process.env.INFLUXDB_BUCKET || 'electricity_data'
        this.isProduction = process.env.NODE_ENV === 'production'
    }

    // Simulate real-time data for development
    generateRealtimeData(): EnergyDataPoint[] {
        const devices = [
            { id: 'dev_001', name: 'Living Room AC', baseConsumption: 1.5, location: 'Living Room' },
            { id: 'dev_002', name: 'Refrigerator', baseConsumption: 0.3, location: 'Kitchen' },
            { id: 'dev_003', name: 'LED TV', baseConsumption: 0.15, location: 'Living Room' },
            { id: 'dev_004', name: 'Washing Machine', baseConsumption: 2.0, location: 'Utility' },
            { id: 'dev_005', name: 'Water Heater', baseConsumption: 3.0, location: 'Bathroom' },
            { id: 'dev_006', name: 'Microwave', baseConsumption: 1.2, location: 'Kitchen' },
            { id: 'dev_007', name: 'Laptop Charger', baseConsumption: 0.065, location: 'Study' },
            { id: 'dev_008', name: 'Ceiling Fans', baseConsumption: 0.2, location: 'All Rooms' }
        ]

        const currentTime = new Date()
        const dataPoints: EnergyDataPoint[] = []

        devices.forEach(device => {
            // Add randomness for realistic simulation
            const variation = 0.8 + (Math.random() * 0.4) // ±20% variation
            const consumption = device.baseConsumption * variation
            const voltage = 220 + (Math.random() * 20 - 10) // 210-230V range
            const current = (consumption * 1000) / voltage // Calculate current
            const power = consumption * 1000 // Convert to watts
            const costPerKwh = 6.5 // Average cost in rupees per kWh
            const cost = consumption * costPerKwh
            const efficiency = Math.min(95, 70 + (Math.random() * 25)) // 70-95% efficiency

            dataPoints.push({
                timestamp: currentTime,
                deviceId: device.id,
                deviceName: device.name,
                consumption,
                voltage,
                current,
                power,
                cost,
                location: device.location,
                efficiency
            })
        })

        return dataPoints
    }

    // Calculate real-time metrics from data points
    calculateRealTimeMetrics(dataPoints: EnergyDataPoint[]): RealTimeMetrics {
        const totalConsumption = dataPoints.reduce((sum, dp) => sum + dp.consumption, 0)
        const totalCost = dataPoints.reduce((sum, dp) => sum + dp.cost, 0)
        const activeDevices = dataPoints.filter(dp => dp.consumption > 0.01).length
        const peakDemand = Math.max(...dataPoints.map(dp => dp.power))
        const averageEfficiency = dataPoints.reduce((sum, dp) => sum + (dp.efficiency || 0), 0) / dataPoints.length

        // Carbon footprint calculation (0.82 kg CO2 per kWh for India)
        const carbonFootprint = totalConsumption * 0.82

        return {
            totalConsumption,
            totalCost,
            activeDevices,
            peakDemand,
            averageEfficiency,
            carbonFootprint
        }
    }

    // Enhanced time series data with different time ranges
    generateTimeSeriesData(range: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'): EnergyDataPoint[] {
        const now = new Date()
        const dataPoints: EnergyDataPoint[] = []

        let intervals: number
        let intervalMs: number

        switch (range) {
            case '1h':
                intervals = 60 // 1 minute intervals
                intervalMs = 60 * 1000
                break
            case '6h':
                intervals = 72 // 5 minute intervals
                intervalMs = 5 * 60 * 1000
                break
            case '24h':
                intervals = 96 // 15 minute intervals
                intervalMs = 15 * 60 * 1000
                break
            case '7d':
                intervals = 168 // 1 hour intervals
                intervalMs = 60 * 60 * 1000
                break
            case '30d':
                intervals = 720 // 1 hour intervals
                intervalMs = 60 * 60 * 1000
                break
        }

        for (let i = 0; i < intervals; i++) {
            const timestamp = new Date(now.getTime() - (intervals - i) * intervalMs)
            const currentData = this.generateRealtimeData()

            // Modify data for time-based patterns
            currentData.forEach(dp => {
                dp.timestamp = timestamp

                // Apply time-of-day patterns
                const hour = timestamp.getHours()
                let timeMultiplier = 1

                if (hour >= 6 && hour <= 9) timeMultiplier = 1.3 // Morning peak
                else if (hour >= 12 && hour <= 14) timeMultiplier = 1.2 // Afternoon
                else if (hour >= 18 && hour <= 22) timeMultiplier = 1.4 // Evening peak
                else if (hour >= 23 || hour <= 5) timeMultiplier = 0.6 // Night low

                dp.consumption *= timeMultiplier
                dp.power *= timeMultiplier
                dp.cost *= timeMultiplier
            })

            dataPoints.push(...currentData)
        }

        return dataPoints
    }

    // Mock InfluxDB connection for development
    async connectToInfluxDB(): Promise<boolean> {
        try {
            if (this.isProduction) {
                // In production, implement actual InfluxDB connection
                console.log('Connecting to InfluxDB in production...')
                return true
            } else {
                // In development, simulate connection
                console.log('🔗 Simulating InfluxDB connection for development')
                return true
            }
        } catch (error) {
            console.error('Failed to connect to InfluxDB:', error)
            return false
        }
    }

    // Data validation and cleaning
    validateDataPoint(dataPoint: EnergyDataPoint): boolean {
        return (
            dataPoint.consumption >= 0 &&
            dataPoint.voltage > 0 &&
            dataPoint.current >= 0 &&
            dataPoint.power >= 0 &&
            dataPoint.cost >= 0 &&
            dataPoint.deviceId.length > 0
        )
    }

    // Export data for analysis
    exportData(dataPoints: EnergyDataPoint[], format: 'json' | 'csv' = 'json'): string {
        if (format === 'csv') {
            const headers = 'timestamp,deviceId,deviceName,consumption,voltage,current,power,cost,location,efficiency\n'
            const rows = dataPoints.map(dp =>
                `${dp.timestamp.toISOString()},${dp.deviceId},${dp.deviceName},${dp.consumption},${dp.voltage},${dp.current},${dp.power},${dp.cost},${dp.location},${dp.efficiency}`
            ).join('\n')
            return headers + rows
        } else {
            return JSON.stringify(dataPoints, null, 2)
        }
    }

    // Energy anomaly detection
    detectAnomalies(dataPoints: EnergyDataPoint[]): Array<{ deviceId: string, anomaly: string, severity: 'low' | 'medium' | 'high' }> {
        const anomalies: Array<{ deviceId: string, anomaly: string, severity: 'low' | 'medium' | 'high' }> = []

        const deviceGroups = dataPoints.reduce((groups, dp) => {
            if (!groups[dp.deviceId]) groups[dp.deviceId] = []
            groups[dp.deviceId].push(dp)
            return groups
        }, {} as Record<string, EnergyDataPoint[]>)

        Object.entries(deviceGroups).forEach(([deviceId, points]) => {
            const avgConsumption = points.reduce((sum, p) => sum + p.consumption, 0) / points.length
            const maxConsumption = Math.max(...points.map(p => p.consumption))

            // High consumption anomaly
            if (maxConsumption > avgConsumption * 2) {
                anomalies.push({
                    deviceId,
                    anomaly: `Consumption spike detected: ${maxConsumption.toFixed(2)} kWh (${(maxConsumption / avgConsumption * 100).toFixed(0)}% above average)`,
                    severity: maxConsumption > avgConsumption * 3 ? 'high' : 'medium'
                })
            }

            // Efficiency anomaly
            const avgEfficiency = points.reduce((sum, p) => sum + (p.efficiency || 0), 0) / points.length
            if (avgEfficiency < 70) {
                anomalies.push({
                    deviceId,
                    anomaly: `Low efficiency detected: ${avgEfficiency.toFixed(1)}%`,
                    severity: avgEfficiency < 50 ? 'high' : 'medium'
                })
            }
        })

        return anomalies
    }
}

// Singleton instance
export const dataPipeline = new DataPipelineService()

