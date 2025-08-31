'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Team } from '@/lib/supabase'
import { 
  Zap, 
  Target, 
  Users, 
  Award, 
  Leaf, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Shield,
  Heart,
  Linkedin,
  Twitter,
  Github,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const stats = [
  { value: "50,000+", label: "Active Users", icon: Users },
  { value: "₹10M+", label: "Savings Generated", icon: TrendingUp },
  { value: "500+", label: "Cities Covered", icon: Globe },
  { value: "98%", label: "User Satisfaction", icon: Heart }
]

const values = [
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "We're committed to reducing carbon footprint and promoting sustainable energy consumption across India."
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Your energy data is protected with enterprise-grade security and privacy measures."
  },
  {
    icon: Target,
    title: "Customer First",
    description: "Every feature is designed with our users' needs and feedback at the center of our development process."
  },
  {
    icon: Award,
    title: "Innovation",
    description: "We continuously innovate to bring cutting-edge AI and energy optimization technologies to everyone."
  }
]

export default function AboutPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (!error && data) {
          setTeams(data)
        }
      } catch (err) {
        console.error('Error fetching teams:', err)
      } finally {
        setLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [])

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Effects - Fixed to cover full page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse animate-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-600/5 rounded-full blur-[120px] animate-pulse animate-delay-4000" />
      </div>

      {/* Main Content - Relative positioning to stay above background */}
      <div className="relative z-10 px-6 py-12 pb-24">
        {/* Header Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            About{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              UrjaBandhu
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
            Empowering millions of users across India to make smarter energy decisions through cutting-edge AI technology and intuitive design.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="max-w-6xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/10">
                    <stat.icon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className="max-w-4xl mx-auto mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Mission
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              To democratize energy optimization and make sustainable living accessible to everyone. We believe that by providing intelligent insights and automated solutions, we can help individuals and businesses reduce their carbon footprint while saving money on energy costs.
            </p>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div 
          className="max-w-6xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do at UrjaBandhu
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group"
              >
                <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg shadow-green-500/10">
                      <value.icon className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          className="max-w-6xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Passionate individuals working together to revolutionize energy management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingTeams ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                    <CardHeader className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Users className="h-12 w-12 text-green-400" />
                      </div>
                      <div className="h-6 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-700/30 rounded animate-pulse w-20 mx-auto"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-700/30 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : teams.length > 0 ? (
              teams.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:border-green-500/30 transition-all duration-500 hover:bg-white/10">
                    <CardHeader className="text-center">
                      <div className="relative mx-auto mb-4 w-24 h-24">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover border-4 border-green-400/20 group-hover:border-green-400/50 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 flex items-center justify-center group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg shadow-green-500/10">
                            <span className="text-lg font-bold text-green-400 group-hover:text-green-300">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                        {member.name}
                      </CardTitle>
                      <div className="text-green-400 text-sm font-medium mb-2">{member.role}</div>
                      {member.department && (
                        <div className="text-gray-400 text-xs">{member.department}</div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {member.bio && (
                        <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed text-center mb-4">
                          {member.bio}
                        </CardDescription>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex justify-center space-x-2">
                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${member.name} on LinkedIn`}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-600 transition-colors duration-200 text-gray-400 hover:text-white"
                          >
                            <Linkedin className="h-3 w-3" />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a
                            href={member.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${member.name} on Twitter`}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-400 transition-colors duration-200 text-gray-400 hover:text-white"
                          >
                            <Twitter className="h-3 w-3" />
                          </a>
                        )}
                        {member.github_url && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${member.name} on GitHub`}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-gray-800 transition-colors duration-200 text-gray-400 hover:text-white"
                          >
                            <Github className="h-3 w-3" />
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            title={`Email ${member.name}`}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-green-600 transition-colors duration-200 text-gray-400 hover:text-white"
                          >
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Fallback when no team data
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="col-span-full text-center py-12"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                  <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    Our team information will be available soon.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Energy Revolution
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the movement towards sustainable energy consumption and start saving money today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 text-lg shadow-xl shadow-green-500/25 transition-all duration-300 rounded-md inline-flex items-center justify-center"
              >
                Get Started Today
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/features"
                className="border border-green-400/30 text-green-400 hover:bg-green-400/10 px-8 py-4 text-lg transition-all duration-300 rounded-md inline-flex items-center justify-center"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
