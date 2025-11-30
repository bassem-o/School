import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Sign in with username and password
  Future<UserModel> signIn({
    required String username,
    required String password,
  }) async {
    // Query users table directly
    final response = await _supabase
        .from('users')
        .select()
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

    if (response == null) {
      throw const AuthException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    return UserModel.fromJson(response);
  }

  // Get user profile by ID
  Future<UserModel?> getUserProfile(String userId) async {
    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();

      return UserModel.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Sign out
  Future<void> signOut() async {
    // No Supabase Auth session to clear, but we might want to clear local storage if we used it here.
    // However, storage is managed by AuthProvider usually.
    // We can still call signOut just in case, but it won't do much for our custom auth.
    // await _supabase.auth.signOut(); 
  }
}
