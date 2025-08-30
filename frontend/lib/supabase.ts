import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables missing:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      nodeEnv: process.env.NODE_ENV
    })

    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file:\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Missing'}`
    )
  }

  // Production configuration improvements
  const isProduction = process.env.NODE_ENV === 'production'

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Production-optimized settings
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Longer timeout for production networks
      storageKey: isProduction ? 'urjabandhu-auth' : 'sb-auth-token',
    },
    // Add retry logic for production
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), isProduction ? 15000 : 10000)

        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))
      },
    },
  })

  console.log('Supabase client created:', {
    environment: isProduction ? 'production' : 'development',
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  })

  return supabaseClient
}

// For backward compatibility
export const supabase = createClient()

// Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pin_code: string | null
          electricity_board: string | null
          monthly_budget: number | null
          notification_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pin_code?: string | null
          electricity_board?: string | null
          monthly_budget?: number | null
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pin_code?: string | null
          electricity_board?: string | null
          monthly_budget?: number | null
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          role: string
          department: string | null
          bio: string | null
          image_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          github_url: string | null
          email: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          department?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          github_url?: string | null
          email?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          department?: string | null
          bio?: string | null
          image_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          github_url?: string | null
          email?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          brand: string | null
          model: string | null
          power_rating: number
          room: string | null
          status: 'active' | 'inactive'
          efficiency_score: number | null
          purchase_date: string | null
          warranty_expiry: string | null
          usage_hours_per_day: number | null
          is_smart_device: boolean
          device_image_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          brand?: string | null
          model?: string | null
          power_rating: number
          room?: string | null
          status?: 'active' | 'inactive'
          efficiency_score?: number | null
          purchase_date?: string | null
          warranty_expiry?: string | null
          usage_hours_per_day?: number | null
          is_smart_device?: boolean
          device_image_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          brand?: string | null
          model?: string | null
          power_rating?: number
          room?: string | null
          status?: 'active' | 'inactive'
          efficiency_score?: number | null
          purchase_date?: string | null
          warranty_expiry?: string | null
          usage_hours_per_day?: number | null
          is_smart_device?: boolean
          device_image_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consumption_data: {
        Row: {
          id: string
          user_id: string
          device_id: string | null
          timestamp: string
          consumption_kwh: number
          cost: number
          rate_per_unit: number | null
          reading_type: 'actual' | 'estimated' | 'manual'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_id?: string | null
          timestamp: string
          consumption_kwh: number
          cost: number
          rate_per_unit?: number | null
          reading_type?: 'actual' | 'estimated' | 'manual'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_id?: string | null
          timestamp?: string
          consumption_kwh?: number
          cost?: number
          rate_per_unit?: number | null
          reading_type?: 'actual' | 'estimated' | 'manual'
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          type: string
          priority: 'high' | 'medium' | 'low'
          title: string
          description: string
          potential_savings: number
          category: string
          action: string
          is_applied: boolean
          applied_at: string | null
          device_id: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          priority: 'high' | 'medium' | 'low'
          title: string
          description: string
          potential_savings: number
          category: string
          action: string
          is_applied?: boolean
          applied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          priority?: 'high' | 'medium' | 'low'
          title?: string
          description?: string
          potential_savings?: number
          category?: string
          action?: string
          is_applied?: boolean
          applied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      energy_alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: 'high_consumption' | 'unusual_pattern' | 'device_offline' | 'cost_threshold' | 'goal_achieved'
          title: string
          message: string
          threshold_value: number | null
          device_id: string | null
          is_read: boolean
          priority: 'high' | 'medium' | 'low'
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: 'high_consumption' | 'unusual_pattern' | 'device_offline' | 'cost_threshold' | 'goal_achieved'
          title: string
          message: string
          threshold_value?: number | null
          device_id?: string | null
          is_read?: boolean
          priority?: 'high' | 'medium' | 'low'
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: 'high_consumption' | 'unusual_pattern' | 'device_offline' | 'cost_threshold' | 'goal_achieved'
          title?: string
          message?: string
          threshold_value?: number | null
          device_id?: string | null
          is_read?: boolean
          priority?: 'high' | 'medium' | 'low'
          action_url?: string | null
          created_at?: string
        }
      }
      energy_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'consumption_reduction' | 'cost_reduction' | 'device_efficiency'
          title: string
          description: string | null
          target_value: number
          current_value: number
          unit: string
          target_date: string | null
          is_achieved: boolean
          achieved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'consumption_reduction' | 'cost_reduction' | 'device_efficiency'
          title: string
          description?: string | null
          target_value: number
          current_value?: number
          unit: string
          target_date?: string | null
          is_achieved?: boolean
          achieved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'consumption_reduction' | 'cost_reduction' | 'device_efficiency'
          title?: string
          description?: string | null
          target_value?: number
          current_value?: number
          unit?: string
          target_date?: string | null
          is_achieved?: boolean
          achieved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      billing_data: {
        Row: {
          id: string
          user_id: string
          bill_month: string
          total_units: number
          total_amount: number
          rate_slab: any | null
          fixed_charges: number
          fuel_surcharge: number
          other_charges: number
          bill_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bill_month: string
          total_units: number
          total_amount: number
          rate_slab?: any | null
          fixed_charges?: number
          fuel_surcharge?: number
          other_charges?: number
          bill_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bill_month?: string
          total_units?: number
          total_amount?: number
          rate_slab?: any | null
          fixed_charges?: number
          fuel_surcharge?: number
          other_charges?: number
          bill_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      device_catalog: {
        Row: {
          id: string
          name: string
          category: string
          subcategory: string | null
          brand: string | null
          model: string | null
          power_rating_min: number | null
          power_rating_max: number | null
          power_rating_avg: number | null
          energy_star_rating: number | null
          keywords: string[]
          description: string | null
          image_url: string | null
          country: string
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_devices_by_keywords: {
        Args: {
          search_text: string
        }
        Returns: Array<{
          id: string
          name: string
          category: string
          power_rating_avg: number
          confidence: number
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Device = Database['public']['Tables']['devices']['Row']
export type ConsumptionData = Database['public']['Tables']['consumption_data']['Row']
export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type EnergyAlert = Database['public']['Tables']['energy_alerts']['Row']
export type EnergyGoal = Database['public']['Tables']['energy_goals']['Row']
export type BillingData = Database['public']['Tables']['billing_data']['Row']
export type DeviceCatalog = Database['public']['Tables']['device_catalog']['Row']
