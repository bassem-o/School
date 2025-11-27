import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/delay_request.dart';
import '../services/supabase_service.dart';

class DelaysProvider with ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();
  
  List<DelayRequest> _delays = [];
  bool _isLoading = false;
  String? _errorMessage;
  RealtimeChannel? _subscription;

  List<DelayRequest> get delays => _delays;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Load teacher's delay requests
  Future<void> loadTeacherDelays(String teacherId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _delays = await _supabaseService.getTeacherDelayRequests(teacherId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load all delay requests (Admin)
  Future<void> loadAllDelays() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _delays = await _supabaseService.getAllDelayRequests();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Submit new delay request
  Future<bool> submitDelayRequest({
    required String teacherId,
    required String teacherName,
    required String subject,
    required List<String> classes,
    required String reason,
  }) async {
    _errorMessage = null;

    try {
      await _supabaseService.submitDelayRequest(
        teacherId: teacherId,
        teacherName: teacherName,
        subject: subject,
        classes: classes,
        reason: reason,
      );
      // Reload delay requests after submission
      await loadTeacherDelays(teacherId);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update delay request status (Admin)
  Future<bool> updateDelayStatus({
    required String requestId,
    required String status,
  }) async {
    _errorMessage = null;
    
    try {
      await _supabaseService.updateDelayStatus(
        requestId: requestId,
        status: status,
      );
      // Reload delay requests after update
      await loadAllDelays();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Subscribe to teacher's delay requests (Real-time)
  void subscribeToTeacherDelays(String teacherId) {
    _subscription?.unsubscribe();
    _subscription = _supabaseService.subscribeToTeacherDelayRequests(
      teacherId: teacherId,
      onData: (delays) {
        _delays = delays;
        notifyListeners();
      },
    );
  }

  // Subscribe to all delay requests (Admin - Real-time)
  void subscribeToAllDelays() {
    _subscription?.unsubscribe();
    _subscription = _supabaseService.subscribeToAllDelayRequests(
      onData: (delays) {
        _delays = delays;
        notifyListeners();
      },
    );
  }

  // Unsubscribe from real-time updates
  void unsubscribe() {
    _subscription?.unsubscribe();
    _subscription = null;
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Delete delay request
  Future<void> deleteDelay(String delayId) async {
    try {
      await _supabaseService.deleteDelayRequest(delayId);
      // Remove from local list
      _delays.removeWhere((d) => d.id == delayId);
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  @override
  void dispose() {
    unsubscribe();
    super.dispose();
  }
}
