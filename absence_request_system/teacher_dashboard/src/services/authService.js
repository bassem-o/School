import { supabase } from './supabaseClient'

export const authService = {
    // Sign in with email and password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    // Sign in with username and password
    async signInWithUsername(username, password) {
        // 1. Get email from username
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('username', username)
            .single()

        if (userError || !user) {
            throw new Error('المستخدم غير موجود')
        }

        // 2. Sign in with email
        return this.signIn(user.email, password)
    },

    // Get user profile
    async getUserProfile(user = null) {
        console.log('getUserProfile: start', user ? 'with provided user' : 'fetching user')

        if (!user) {
            const { data } = await supabase.auth.getUser()
            user = data.user
        }

        console.log('getUserProfile: auth user retrieved', user?.id)

        if (!user) return null

        console.log('getUserProfile: querying users table')

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database query timed out')), 5000)
        )

        try {
            const { data, error } = await Promise.race([
                supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single(),
                timeoutPromise
            ])

            if (error) {
                console.error('getUserProfile: error querying users table', error)
                throw error
            }
            console.log('getUserProfile: users table query success', data)
            return data
        } catch (err) {
            console.error('getUserProfile: query failed or timed out', err)
            // Fallback: return basic user info if DB fails, but role will be missing
            // This might cause "Not Authorized" but at least it won't hang
            return {
                id: user.id,
                email: user.email,
                role: 'user', // Default to user
                isFallback: true
            }
        }
    },

    // Check if user is admin
    async isAdmin() {
        const profile = await this.getUserProfile()
        return profile?.role === 'admin'
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Get current session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    // Listen to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    },
}
