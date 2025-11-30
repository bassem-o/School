import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useDelays(initialStatus = null, initialLimit = 50) {
    const [delays, setDelays] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDelays(initialStatus, initialLimit)

        // Subscribe to real-time updates
        const channel = supabase
            .channel('all_delays')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'delay_requests',
                },
                () => {
                    fetchDelays(initialStatus, initialLimit)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchDelays(statusFilter = null, limit = 50) {
        try {
            setLoading(true)
            setError(null)

            let query = supabase
                .from('delay_requests')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit)

            if (statusFilter) {
                query = query.eq('status', statusFilter)
            }

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out. Please retry.')), 10000)
            )

            const { data, error } = await Promise.race([
                query,
                timeoutPromise
            ])

            if (error) throw error

            setDelays(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching delays:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateDelayStatus(delayId, newStatus, minutes = null) {
        try {
            const updates = { status: newStatus }
            if (minutes !== null) {
                updates.minutes = parseInt(minutes)
            }

            const { error } = await supabase
                .from('delay_requests')
                .update(updates)
                .eq('id', delayId)

            if (error) throw error

            // Optimistically update local state
            setDelays(prev =>
                prev.map(delay =>
                    delay.id === delayId ? { ...delay, ...updates } : delay
                )
            )

            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    return {
        delays,
        loading,
        error,
        updateDelayStatus,
        refetch: fetchDelays,
    }
}
