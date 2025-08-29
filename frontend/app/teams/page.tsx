'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Team } from '@/lib/supabase'
import { Linkedin, Twitter, Github, Mail, Loader2 } from 'lucide-react'
import PublicHeader from '@/components/navigation/PublicHeader'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (error) {
          setError(error.message)
        } else {
          setTeams(data || [])
        }
      } catch (err) {
        setError('Failed to fetch team data')
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Teams</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Our <span className="text-blue-400">Team</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the passionate individuals behind UrjaBandhu who are dedicated to revolutionizing 
            energy management and building a sustainable future for India.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-32 h-32">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-4 border-blue-400/20 group-hover:border-blue-400/50 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-blue-400/20 group-hover:border-blue-400/50 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-blue-400 font-medium mb-2">{member.role}</p>
                {member.department && (
                  <p className="text-gray-400 text-sm mb-4">{member.department}</p>
                )}
                
                {member.bio && (
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {member.bio}
                  </p>
                )}

                <div className="flex justify-center space-x-3">
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${member.name} on LinkedIn`}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-600 transition-colors duration-200 text-gray-400 hover:text-white"
                    >
                      <Linkedin className="h-4 w-4" />
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
                      <Twitter className="h-4 w-4" />
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
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={`Email ${member.name}`}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-green-600 transition-colors duration-200 text-gray-400 hover:text-white"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No team members found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
