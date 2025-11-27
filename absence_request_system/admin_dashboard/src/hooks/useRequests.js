import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useRequests(initialStatus = null) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRequests(initialStatus)

        // Subscribe to real-time updates
        const channel = supabase
            .channel('all_requests')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'absence_requests',
                },
                () => {
                    fetchRequests(initialStatus)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchRequests(statusFilter = null) {
        try {
            setLoading(true)
            let query = supabase
                .from('absence_requests')
                .select('*')
                .order('date', { ascending: false })

            if (statusFilter) {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error

            setRequests(data)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching requests:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateRequestStatus(requestId, newStatus) {
        try {
            const { error } = await supabase
                .from('absence_requests')
                .update({ status: newStatus })
                .eq('id', requestId)

            if (error) throw error

            // Optimistically update local state
            setRequests(prev =>
                prev.map(req =>
                    req.id === requestId ? { ...req, status: newStatus } : req
                )
            )

            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    return {
        requests,
        loading,
        error,
        updateRequestStatus,
        refetch: fetchRequests,
    }
}
