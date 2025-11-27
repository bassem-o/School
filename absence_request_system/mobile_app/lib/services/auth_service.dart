import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get current user
  User? get currentUser => _supabase.auth.currentUser;

  // Check if user is logged in
  bool get isLoggedIn => currentUser != null;

  // Sign in with username and password
  Future<AuthResponse> signIn({
    required String username,
    required String password,
  }) async {
    // 1. Query Supabase to find email for the username
    final response = await _supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .maybeSingle();

    if (response == null) {
      throw const AuthException('المستخدم غير موجود');
    }

    final email = response['email'] as String;

    // 2. Authenticate using email and password
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Get user profile from users table
  Future<UserModel?> getUserProfile() async {
    if (!isLoggedIn) return null;

    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('id', currentUser!.id)
          .single();

      return UserModel.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  // Listen to auth state changes
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
}
