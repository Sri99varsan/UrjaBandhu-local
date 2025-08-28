import Link from 'next/link'
import { Zap, BarChart3, Brain, Globe, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-electricity-50 to-energy-50">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Smart Electricity</span>
              <span className="block electricity-gradient bg-clip-text text-transparent">
                Bill Optimization
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Reduce your electricity bills by 15-20% with AI-powered insights, real-time monitoring, 
              and personalized optimization recommendations.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-electricity-600 hover:bg-electricity-700 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Start Optimizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Intelligent Energy Management
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Advanced AI and machine learning technologies to optimize your electricity consumption
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-electricity-500 text-white mx-auto">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Real-time Analytics</h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your electricity consumption in real-time with detailed breakdowns by device and time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-energy-500 text-white mx-auto">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">AI Recommendations</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get personalized suggestions to optimize your energy usage and reduce costs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-electricity-500 text-white mx-auto">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Device Detection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Automatically detect and monitor individual appliances using advanced NILM technology.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-energy-500 text-white mx-auto">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Multi-language Support</h3>
                <p className="mt-2 text-base text-gray-500">
                  Voice-enabled AI assistant supporting Hindi, Bengali, Tamil, Telugu, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-electricity-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">15-20%</div>
              <div className="mt-2 text-electricity-100">Average Bill Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="mt-2 text-electricity-100">Real-time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">5+</div>
              <div className="mt-2 text-electricity-100">Indian Languages Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Ready to optimize your electricity consumption?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of users who have already reduced their electricity bills with UrjaBandhu.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-electricity-600 hover:bg-electricity-700 transition-colors"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-electricity-400" />
              <span className="ml-2 text-xl font-bold text-white">UrjaBandhu</span>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-400">
            Empowering smart energy management for a sustainable future.
          </p>
        </div>
      </footer>
    </div>
  )
}
