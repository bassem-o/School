import { supabase } from './supabaseClient'

// Custom session management
const SESSION_KEY = 'teacher_session'

export const authService = {
    // Sign in with username and password from users table
    async signInWithUsername(username, password) {
        console.log('signInWithUsername: Attempting login for', username)

        // 1. Query users table directly (Primary Authentication)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .eq('role', 'teacher')
            .single()

        if (userError || !user) {
            console.error('signInWithUsername: Login failed', userError)
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
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

    // Check if username already exists
    async checkUsernameExists(username, excludeUserId) {
        console.log('checkUsernameExists: Checking username', username)

        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .neq('id', excludeUserId)
            .maybeSingle()

        if (error) {
            console.error('checkUsernameExists: Query failed', error)
            throw new Error('فشل التحقق من اسم المستخدم')
        }

        return !!data
    },

    // Update username and/or password
    async updateCredentials(userId, newUsername, newPassword) {
        console.log('updateCredentials: Updating for user', userId)

        const updates = {}

        // Check if username is being changed and if it exists
        if (newUsername) {
            const exists = await this.checkUsernameExists(newUsername, userId)
            if (exists) {
                throw new Error('اسم المستخدم موجود بالفعل')
            }
            updates.username = newUsername
        }

        if (newPassword) updates.password = newPassword

        if (Object.keys(updates).length === 0) {
            throw new Error('لا توجد تغييرات للحفظ')
        }

        // 1. Update users table
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) {
            console.error('updateCredentials: Update failed', error)
            throw new Error('فشل تحديث البيانات')
        }

        console.log('updateCredentials: Database update successful', data)

        // Update session with new profile data
        const currentSession = this.getSession()
        if (currentSession) {
            currentSession.profile = data
            localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession))
        }

        return data
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
