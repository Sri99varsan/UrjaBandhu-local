import Link from 'next/link'
import { Zap, BarChart3, Brain, Globe, Users, ArrowRight, Star, Check, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8">
              <Star className="mr-1 h-3 w-3" />
              #1 Energy Management Platform
            </Badge>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Smart Electricity{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Bill Optimization
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Reduce your electricity bills by 15-20% with AI-powered insights, real-time monitoring, 
              and personalized optimization recommendations.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/dashboard">
                  Start Optimizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base">
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
            
            <div className="mt-16 flex flex-col items-center justify-center gap-8 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                No installation required
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                AI-powered insights
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                Real-time monitoring
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Intelligent Energy Management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Advanced AI and machine learning technologies to optimize your electricity consumption
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor your electricity consumption in real-time with detailed breakdowns by device and time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized suggestions to optimize your energy usage and reduce costs.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Device Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and monitor individual appliances using advanced NILM technology.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Multi-language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Voice-enabled AI assistant supporting Hindi, Bengali, Tamil, Telugu, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              <div>
                <div className="text-4xl font-bold text-primary-foreground md:text-5xl">15-20%</div>
                <p className="mt-2 text-primary-foreground/80">Average Bill Reduction</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-foreground md:text-5xl">24/7</div>
                <p className="mt-2 text-primary-foreground/80">Real-time Monitoring</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-foreground md:text-5xl">5+</div>
                <p className="mt-2 text-primary-foreground/80">Indian Languages Supported</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to optimize your electricity consumption?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users who have already reduced their electricity bills with UrjaBandhu.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UrjaBandhu</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Empowering smart energy management for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
