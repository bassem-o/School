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
    async getUserProfile() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error
        return data
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
