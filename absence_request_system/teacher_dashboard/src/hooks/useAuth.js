import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Safety timeout
        const timeoutId = setTimeout(() => {
            setLoading(false)
            console.warn('Auth loading timed out, forcing render')
        }, 3000)

        // Check current session
        checkSession()

        // Listen to auth changes
        const { data: { subscription } } = authService.onAuthStateChange(
            async (event, session) => {
                try {
                    console.log('Auth state change:', event, session?.user?.id)
                    if (session?.user) {
                        setUser(session.user)
                        setProfile(session.profile || null)
                    } else {
                        setUser(null)
                        setProfile(null)
                    }
                } catch (error) {
                    console.error('Error in auth state change:', error)
                } finally {
                    setLoading(false)
                    clearTimeout(timeoutId)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeoutId)
        }
    }, [])

    async function checkSession() {
        try {
            console.log('checkSession: starting')
            const session = authService.getSession()
            console.log('checkSession: session retrieved', session)

            if (session?.user) {
                setUser(session.user)
                setProfile(session.profile || null)
                console.log('checkSession: user and profile set')
            } else {
                setUser(null)
                setProfile(null)
            }
        } catch (error) {
            console.error('Error checking session:', error)
            setUser(null)
            setProfile(null)
        } finally {
            console.log('checkSession: finished, setting loading false')
            setLoading(false)
        }
    }

    async function signIn(username, password) {
        try {
            const result = await authService.signInWithUsername(username, password)
            setUser(result.user)
            setProfile(result.profile)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async function signOut() {
        try {
            await authService.signOut()
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        isAdmin: profile?.role === 'admin',
        isTeacher: profile?.role === 'teacher',
        signIn,
        signOut,
    }
}
