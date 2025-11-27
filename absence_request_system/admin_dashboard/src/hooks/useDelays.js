import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useDelays(initialStatus = null) {
    const [delays, setDelays] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDelays(initialStatus)

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
                    fetchDelays(initialStatus)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchDelays(statusFilter = null) {
        try {
            setLoading(true)
            let query = supabase
                .from('delay_requests')
                .select('*')
                .order('date', { ascending: false })

            if (statusFilter) {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error

            setDelays(data)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching delays:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateDelayStatus(delayId, newStatus) {
        try {
            const { error } = await supabase
                .from('delay_requests')
                .update({ status: newStatus })
                .eq('id', delayId)

            if (error) throw error

            // Optimistically update local state
            setDelays(prev =>
                prev.map(delay =>
                    delay.id === delayId ? { ...delay, status: newStatus } : delay
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
