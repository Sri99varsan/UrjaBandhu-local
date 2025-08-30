import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// Query keys for consistent caching
export const queryKeys = {
    user: ['user'] as const,
    profile: (userId: string) => ['profile', userId] as const,
    energyData: (userId: string, timeRange?: string) => ['energyData', userId, timeRange] as const,
    recommendations: (userId: string) => ['recommendations', userId] as const,
} as const

// User profile query hook
export function useUserProfile(userId?: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: queryKeys.profile(userId || ''),
        queryFn: async () => {
            if (!userId) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

// Energy data query hook
export function useEnergyData(userId?: string, timeRange: string = '7d') {
    const supabase = createClient()

    return useQuery({
        queryKey: queryKeys.energyData(userId || '', timeRange),
        queryFn: async () => {
            if (!userId) return null

            const { data, error } = await supabase
                .from('energy_consumption')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false })
                .limit(100)

            if (error) throw error
            return data
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes for energy data
    })
}

// Recommendations query hook
export function useRecommendations(userId?: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: queryKeys.recommendations(userId || ''),
        queryFn: async () => {
            if (!userId) return null

            const { data, error } = await supabase
                .from('recommendations')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes for recommendations
    })
}

// Update profile mutation
export function useUpdateProfile() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (profileData: { id: string;[key: string]: any }) => {
            const { data, error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', profileData.id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(data.id) })
            queryClient.setQueryData(queryKeys.profile(data.id), data)
        },
    })
}

// Add energy consumption mutation
export function useAddEnergyData() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (energyData: {
            user_id: string
            device_name: string
            consumption: number
            timestamp?: string
        }) => {
            const { data, error } = await supabase
                .from('energy_consumption')
                .insert([{
                    ...energyData,
                    timestamp: energyData.timestamp || new Date().toISOString()
                }])
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            // Invalidate energy data queries for this user
            queryClient.invalidateQueries({
                queryKey: queryKeys.energyData(variables.user_id)
            })
        },
    })
}

// Generic Supabase query hook for custom queries
export function useSupabaseQuery<T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    options?: {
        enabled?: boolean
        staleTime?: number
        retry?: number
    }
) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime || 1000 * 60 * 5,
        retry: options?.retry || 3,
        enabled: options?.enabled !== false,
    })
}
