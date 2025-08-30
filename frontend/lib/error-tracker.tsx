'use client'

import React from 'react'

interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorTracker {
  private errors: ErrorInfo[] = []
  private sessionId: string = ''
  private userId?: string
  private isEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionId = this.generateSessionId()
      this.setupGlobalErrorHandlers()
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        severity: 'medium',
        tags: {
          type: 'javascript-error',
          filename: event.filename,
          lineno: event.lineno?.toString(),
          colno: event.colno?.toString()
        }
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        severity: 'high',
        tags: {
          type: 'unhandled-promise-rejection'
        }
      })
    })

    // Handle network errors (fetch failures)
    this.interceptFetch()
  }

  private interceptFetch() {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Track HTTP errors
        if (!response.ok) {
          this.trackError({
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.userId,
            sessionId: this.sessionId,
            severity: response.status >= 500 ? 'high' : 'medium',
            tags: {
              type: 'http-error',
              status: response.status.toString(),
              endpoint: args[0]?.toString()
            }
          })
        }
        
        return response
      } catch (error) {
        // Track network errors
        this.trackError({
          message: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: this.userId,
          sessionId: this.sessionId,
          severity: 'high',
          tags: {
            type: 'network-error',
            endpoint: args[0]?.toString()
          }
        })
        throw error
      }
    }
  }

  trackError(errorInfo: Partial<ErrorInfo> & { message: string }) {
    if (!this.isEnabled) return

    const fullErrorInfo: ErrorInfo = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      severity: 'medium',
      ...errorInfo,
      userId: this.userId
    }

    this.errors.push(fullErrorInfo)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Tracked:', fullErrorInfo)
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(fullErrorInfo)
    }
  }

  trackComponentError(error: Error, errorInfo: React.ErrorInfo, componentName?: string) {
    this.trackError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      severity: 'high',
      tags: {
        type: 'react-error',
        component: componentName || 'unknown'
      }
    })
  }

  trackUserAction(action: string, details?: Record<string, any>) {
    // Track user actions for error context
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 User Action:', { action, details, timestamp: Date.now() })
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  setTags(tags: Record<string, string>) {
    // Set global tags for all future errors
    this.errors.forEach(error => {
      error.tags = { ...error.tags, ...tags }
    })
  }

  private async sendErrorToService(errorInfo: ErrorInfo) {
    try {
      // Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      })
    } catch (error) {
      console.error('Failed to send error to tracking service:', error)
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker()

// React Error Boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.trackComponentError(error, errorInfo, this.constructor.name)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              We're sorry, but something unexpected happened. Our team has been notified.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// React hook for error tracking
export function useErrorTracker() {
  const trackError = (message: string, error?: Error, severity?: ErrorInfo['severity'], tags?: Record<string, string>) => {
    errorTracker.trackError({
      message,
      stack: error?.stack,
      severity: severity || 'medium',
      tags
    })
  }

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    errorTracker.trackUserAction(action, details)
  }

  const setUserId = (userId: string) => {
    errorTracker.setUserId(userId)
  }

  return {
    trackError,
    trackUserAction,
    setUserId,
    getErrors: () => errorTracker.getErrors(),
    clearErrors: () => errorTracker.clearErrors()
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error }>
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorTracker
