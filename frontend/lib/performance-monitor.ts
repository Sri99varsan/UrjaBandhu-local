// Performance monitoring and analytics for production readiness
'use client'

import React from 'react'

interface PerformanceMetric {
    name: string
    value: number
    timestamp: number
    type: 'timing' | 'counter' | 'gauge'
    tags?: Record<string, string>
}

interface WebVitalsMetric {
    name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = []
    private vitalsMetrics: WebVitalsMetric[] = []
    private isEnabled: boolean = true

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupWebVitals()
            this.setupNavigationTiming()
            this.setupResourceTiming()
        }
    }

    // Record custom metric
    recordMetric(name: string, value: number, type: 'timing' | 'counter' | 'gauge' = 'gauge', tags?: Record<string, string>) {
        if (!this.isEnabled) return

        const metric: PerformanceMetric = {
            name,
            value,
            timestamp: Date.now(),
            type,
            tags
        }

        this.metrics.push(metric)

        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Performance Metric:', metric)
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
            this.sendMetricToAnalytics(metric)
        }
    }

    // Setup Web Vitals monitoring
    private setupWebVitals() {
        // We'll use the web-vitals library for accurate measurements
        if (typeof window !== 'undefined') {
            import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
                onCLS(this.handleWebVital.bind(this))
                onFCP(this.handleWebVital.bind(this))
                onLCP(this.handleWebVital.bind(this))
                onTTFB(this.handleWebVital.bind(this))
                onINP(this.handleWebVital.bind(this))
            }).catch(() => {
                // Fallback to manual measurements if web-vitals is not available
                this.setupFallbackVitals()
            })
        }
    }

    private handleWebVital(metric: any) {
        const vitalsMetric: WebVitalsMetric = {
            name: metric.name as WebVitalsMetric['name'],
            value: metric.value,
            rating: metric.rating as WebVitalsMetric['rating'],
            timestamp: Date.now()
        }

        this.vitalsMetrics.push(vitalsMetric)

        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Web Vital:', vitalsMetric)
        }

        if (process.env.NODE_ENV === 'production') {
            this.sendVitalToAnalytics(vitalsMetric)
        }
    }

    // Fallback vitals measurement
    private setupFallbackVitals() {
        if (typeof window === 'undefined') return

        // Measure First Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            entries.forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                    this.recordMetric('FCP', entry.startTime, 'timing')
                }
            })
        }).observe({ entryTypes: ['paint'] })

        // Measure Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lastEntry = entries[entries.length - 1]
            if (lastEntry) {
                this.recordMetric('LCP', lastEntry.startTime, 'timing')
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // Setup Navigation Timing
    private setupNavigationTiming() {
        if (typeof window === 'undefined') return

        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

            if (navigation) {
                this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'timing')
                this.recordMetric('load-complete', navigation.loadEventEnd - navigation.loadEventStart, 'timing')
                this.recordMetric('dns-lookup', navigation.domainLookupEnd - navigation.domainLookupStart, 'timing')
                this.recordMetric('tcp-connect', navigation.connectEnd - navigation.connectStart, 'timing')
                this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart, 'timing')
            }
        })
    }

    // Setup Resource Timing
    private setupResourceTiming() {
        if (typeof window === 'undefined') return

        new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach((entry) => {
                const resource = entry as PerformanceResourceTiming

                // Track slow resources
                if (resource.duration > 1000) { // > 1 second
                    this.recordMetric('slow-resource', resource.duration, 'timing', {
                        resource: resource.name,
                        type: resource.initiatorType
                    })
                }
            })
        }).observe({ entryTypes: ['resource'] })
    }

    // Memory usage monitoring
    measureMemoryUsage() {
        if (typeof window === 'undefined' || !('memory' in performance)) return

        const memory = (performance as any).memory
        this.recordMetric('heap-used', memory.usedJSHeapSize, 'gauge')
        this.recordMetric('heap-total', memory.totalJSHeapSize, 'gauge')
        this.recordMetric('heap-limit', memory.jsHeapSizeLimit, 'gauge')
    }

    // React-specific performance monitoring
    measureComponentRender(componentName: string, renderTime: number) {
        this.recordMetric('component-render', renderTime, 'timing', {
            component: componentName
        })
    }

    // API call performance
    measureAPICall(endpoint: string, duration: number, status: number) {
        this.recordMetric('api-call', duration, 'timing', {
            endpoint,
            status: status.toString()
        })
    }

    // Database query performance
    measureDBQuery(query: string, duration: number) {
        this.recordMetric('db-query', duration, 'timing', {
            query: query.substring(0, 50) // Truncate for privacy
        })
    }

    // Send metric to analytics service
    private async sendMetricToAnalytics(metric: PerformanceMetric) {
        try {
            // Send to your analytics service (e.g., Google Analytics, Mixpanel, etc.)
            await fetch('/api/analytics/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metric)
            })
        } catch (error) {
            console.error('Failed to send metric to analytics:', error)
        }
    }

    private async sendVitalToAnalytics(vital: WebVitalsMetric) {
        try {
            await fetch('/api/analytics/vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vital)
            })
        } catch (error) {
            console.error('Failed to send vital to analytics:', error)
        }
    }

    // Get current metrics
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics]
    }

    getVitals(): WebVitalsMetric[] {
        return [...this.vitalsMetrics]
    }

    // Clear metrics
    clearMetrics() {
        this.metrics = []
        this.vitalsMetrics = []
    }

    // Enable/disable monitoring
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled
    }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
    const recordMetric = (name: string, value: number, type?: 'timing' | 'counter' | 'gauge', tags?: Record<string, string>) => {
        performanceMonitor.recordMetric(name, value, type, tags)
    }

    const measureComponentRender = (componentName: string, renderTime: number) => {
        performanceMonitor.measureComponentRender(componentName, renderTime)
    }

    const measureAPICall = (endpoint: string, duration: number, status: number) => {
        performanceMonitor.measureAPICall(endpoint, duration, status)
    }

    const measureMemoryUsage = () => {
        performanceMonitor.measureMemoryUsage()
    }

    return {
        recordMetric,
        measureComponentRender,
        measureAPICall,
        measureMemoryUsage,
        getMetrics: () => performanceMonitor.getMetrics(),
        getVitals: () => performanceMonitor.getVitals()
    }
}

// HOC for measuring component render performance
export function withPerformanceMonitoring<P extends object>(
    Component: React.ComponentType<P>,
    componentName: string
) {
    return function PerformanceMonitoredComponent(props: P) {
        const { measureComponentRender } = usePerformanceMonitor()

        React.useEffect(() => {
            const startTime = performance.now()

            return () => {
                const endTime = performance.now()
                measureComponentRender(componentName, endTime - startTime)
            }
        })

        return React.createElement(Component, props)
    }
}

export default PerformanceMonitor
