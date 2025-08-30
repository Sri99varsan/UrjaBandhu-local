"use client";

import { useState, useEffect } from 'react'
import { dataPipeline, EnergyDataPoint, RealTimeMetrics } from './real-time-service'

// Real-time data hooks for React components
export function useRealTimeData() {
    const [data, setData] = useState<EnergyDataPoint[]>([])
    const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    

    useEffect(() => {
        const updateData = () => {
            const newData = dataPipeline.generateRealtimeData()
            const newMetrics = dataPipeline.calculateRealTimeMetrics(newData)
            setData(newData)
            setMetrics(newMetrics)
        }

        // Connect to data source
        dataPipeline.connectToInfluxDB().then(setIsConnected)

        // Update data every 30 seconds for real-time feel
        updateData()
        const interval = setInterval(updateData, 30000)

        return () => clearInterval(interval)
    }, [])

    return { data, metrics, isConnected }
}
