import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check current session
        checkSession()

        // Listen to auth changes
        const { data: { subscription } } = authService.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user)
                    const userProfile = await authService.getUserProfile()
                    setProfile(userProfile)
                } else {
                    setUser(null)
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    async function checkSession() {
        try {
            const session = await authService.getSession()
            if (session?.user) {
                setUser(session.user)
                const userProfile = await authService.getUserProfile()
                setProfile(userProfile)
            }
        } catch (error) {
            console.error('Error checking session:', error)
        } finally {
            setLoading(false)
        }
    }

    async function signIn(username, password) {
        try {
            await authService.signInWithUsername(username, password)
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
        signIn,
        signOut,
    }
}
