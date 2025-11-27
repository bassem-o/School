import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn => _currentUser != null;
  bool get isTeacher => _currentUser?.role == 'teacher';
  bool get isAdmin => _currentUser?.role == 'admin';

  // Sign in
  Future<bool> signIn({
    required String username,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.signIn(username: username, password: password);
      await loadUserProfile();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      if (e.toString().contains('AuthException')) {
        _errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      }
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Load user profile
  Future<void> loadUserProfile() async {
    try {
      _currentUser = await _authService.getUserProfile();
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _authService.signOut();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
