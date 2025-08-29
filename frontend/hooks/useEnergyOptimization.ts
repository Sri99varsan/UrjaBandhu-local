/**
 * React Hooks for Energy Optimization
 * Custom hooks for AI-powered energy insights and recommendations
 */

import { useState, useEffect } from 'react'
import { energyOptimizationService, EnergyInsight, SmartRecommendation, EnergyPattern, EnvironmentalImpact } from '@/lib/energy-optimization'

export function useEnergyInsights(userId: string, autoRefresh = false) {
  const [insights, setInsights] = useState<EnergyInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await energyOptimizationService.generateEnergyInsights(userId)
      setInsights(data)
    } catch (err) {
      setError('Failed to load energy insights')
      console.error('Error fetching energy insights:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchInsights()
    }
  }, [userId])

  useEffect(() => {
    if (autoRefresh && userId) {
      const interval = setInterval(fetchInsights, 5 * 60 * 1000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh, userId])

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  }
}

export function useSmartRecommendations(userId: string) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set())

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await energyOptimizationService.getSmartRecommendations(userId)
      setRecommendations(data)
    } catch (err) {
      setError('Failed to load recommendations')
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const executeRecommendation = async (recommendationId: string): Promise<boolean> => {
    try {
      setExecutingActions(prev => new Set(prev).add(recommendationId))
      const success = await energyOptimizationService.executeOptimizationAction(recommendationId, userId)
      
      if (success) {
        // Refresh recommendations after successful execution
        await fetchRecommendations()
      }
      
      return success
    } catch (err) {
      console.error('Error executing recommendation:', err)
      return false
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(recommendationId)
        return newSet
      })
    }
  }

  useEffect(() => {
    if (userId) {
      fetchRecommendations()
    }
  }, [userId])

  return {
    recommendations,
    loading,
    error,
    executingActions,
    executeRecommendation,
    refetch: fetchRecommendations
  }
}

export function useEnergyPatterns(userId: string) {
  const [patterns, setPatterns] = useState<EnergyPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatterns = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await energyOptimizationService.analyzeEnergyPatterns(userId)
      setPatterns(data)
    } catch (err) {
      setError('Failed to analyze energy patterns')
      console.error('Error fetching energy patterns:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchPatterns()
    }
  }, [userId])

  return {
    patterns,
    loading,
    error,
    refetch: fetchPatterns
  }
}

export function useEnvironmentalImpact(userId: string) {
  const [impact, setImpact] = useState<EnvironmentalImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImpact = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await energyOptimizationService.calculateEnvironmentalImpact(userId)
      setImpact(data)
    } catch (err) {
      setError('Failed to calculate environmental impact')
      console.error('Error fetching environmental impact:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchImpact()
    }
  }, [userId])

  return {
    impact,
    loading,
    error,
    refetch: fetchImpact
  }
}

export function useEnergyEfficiencyScore(userId: string) {
  const [score, setScore] = useState<{
    overall_score: number
    category_scores: Record<string, number>
    improvement_areas: string[]
    benchmark_comparison: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScore = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await energyOptimizationService.getEnergyEfficiencyScore(userId)
      setScore(data)
    } catch (err) {
      setError('Failed to calculate efficiency score')
      console.error('Error fetching efficiency score:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchScore()
    }
  }, [userId])

  return {
    score,
    loading,
    error,
    refetch: fetchScore
  }
}
