import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useRequests(initialStatus = null, initialLimit = 50) {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRequests(initialStatus, initialLimit)

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
                    fetchRequests(initialStatus, initialLimit)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchRequests(statusFilter = null, limit = 50) {
        try {
            setLoading(true)
            setError(null)

            let query = supabase
                .from('absence_requests')
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

            setRequests(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching requests:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateRequestStatus(requestId, newStatus, type = null) {
        try {
            const updates = {}
            if (newStatus !== null) {
                updates.status = newStatus
            }
            if (type !== null) {
                updates.type = type
            }

            const { error } = await supabase
                .from('absence_requests')
                .update(updates)
                .eq('id', requestId)

            if (error) throw error

            // Optimistically update local state
            setRequests(prev =>
                prev.map(req =>
                    req.id === requestId ? { ...req, ...updates } : req
                )
            )

            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    async function deleteRequest(requestId) {
        try {
            const { error } = await supabase
                .from('absence_requests')
                .delete()
                .eq('id', requestId)

            if (error) throw error

            // Optimistically update local state
            setRequests(prev => prev.filter(req => req.id !== requestId))

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
        deleteRequest,
        refetch: fetchRequests,
    }
}
