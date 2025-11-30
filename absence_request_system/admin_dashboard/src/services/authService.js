import { supabase } from './supabaseClient'

// Custom session management
const SESSION_KEY = 'admin_session'

export const authService = {
    // Sign in with username and password
    async signInWithUsername(username, password) {
        console.log('signInWithUsername: Attempting login for', username)

        // 1. Query users table directly
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .eq('role', 'admin') // Enforce admin role
            .single()

        if (userError || !user) {
            console.error('signInWithUsername: Login failed', userError)
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة أو ليس لديك صلاحية المسؤول')
        }

        console.log('signInWithUsername: Database login successful', user.id)

        // Store session in localStorage
        const sessionData = {
            user: {
                id: user.id,
                email: user.email
            },
            profile: user,
            timestamp: Date.now()
        }

        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))

        return { user: sessionData.user, profile: user }
    },

    // Get user profile
    async getUserProfile(user = null) {
        console.log('getUserProfile: start')

        // Get from session
        const sessionData = this.getSession()
        if (!sessionData) {
            console.log('getUserProfile: No session found')
            return null
        }

        if (!user) {
            user = sessionData.user
        }

        console.log('getUserProfile: user retrieved', user?.id)

        if (!user) return null

        // Return cached profile if available
        if (sessionData.profile) {
            console.log('getUserProfile: returning cached profile')
            return sessionData.profile
        }

        console.log('getUserProfile: querying users table')

        // Query users table
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('getUserProfile: error querying users table', error)
            throw error
        }

        console.log('getUserProfile: users table query success', data)

        // Update session with profile
        const currentSession = this.getSession()
        if (currentSession) {
            currentSession.profile = data
            localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession))
        }

        return data
    },

    // Check if user is admin
    async isAdmin() {
        const profile = await this.getUserProfile()
        return profile?.role === 'admin'
    },

    // Sign out
    async signOut() {
        console.log('signOut: Clearing session')
        localStorage.removeItem(SESSION_KEY)
    },

    // Get current session
    getSession() {
        const sessionStr = localStorage.getItem(SESSION_KEY)
        if (!sessionStr) return null

        try {
            const sessionData = JSON.parse(sessionStr)

            // Check if session is expired (24 hours)
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            if (Date.now() - sessionData.timestamp > maxAge) {
                console.log('getSession: Session expired')
                localStorage.removeItem(SESSION_KEY)
                return null
            }

            return sessionData
        } catch (error) {
            console.error('getSession: Error parsing session', error)
            localStorage.removeItem(SESSION_KEY)
            return null
        }
    },

    // Listen to auth changes (mock for compatibility)
    onAuthStateChange(callback) {
        // Check session immediately
        const sessionData = this.getSession()
        if (sessionData) {
            setTimeout(() => callback('SIGNED_IN', sessionData), 0)
        }

        // Return mock subscription
        return {
            data: {
                subscription: {
                    unsubscribe: () => { }
                }
            }
        }
    },
}
