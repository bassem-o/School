import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/absence_request.dart';
import '../models/teacher_model.dart';
import '../services/supabase_service.dart';

class RequestsProvider with ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();
  
  List<AbsenceRequest> _requests = [];
  TeacherModel? _teacherDetails;
  bool _isLoading = false;
  String? _errorMessage;
  RealtimeChannel? _subscription;

  List<AbsenceRequest> get requests => _requests;
  TeacherModel? get teacherDetails => _teacherDetails;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Load teacher details
  Future<void> loadTeacherDetails(String userId) async {
    try {
      _teacherDetails = await _supabaseService.getTeacherDetails(userId);
      notifyListeners();
    } catch (e) {
      print('Error loading teacher details: $e');
    }
  }

  // Load teacher's requests
  Future<void> loadTeacherRequests(String teacherId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _requests = await _supabaseService.getTeacherRequests(teacherId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load all requests (Admin)
  Future<void> loadAllRequests() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _requests = await _supabaseService.getAllRequests();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Submit new request
  Future<bool> submitRequest({
    required String teacherId,
    required String teacherName,
    required String reason,
  }) async {
    _errorMessage = null;
    
    // Ensure we have teacher details
    if (_teacherDetails == null) {
      await loadTeacherDetails(teacherId);
      if (_teacherDetails == null) {
        _errorMessage = 'تعذر تحميل بيانات المعلم';
        notifyListeners();
        return false;
      }
    }

    try {
      await _supabaseService.submitAbsenceRequest(
        teacherId: teacherId,
        teacherName: teacherName,
        subject: _teacherDetails!.subject,
        classes: _teacherDetails!.classes,
        reason: reason,
      );
      // Reload requests after submission
      await loadTeacherRequests(teacherId);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update request status (Admin)
  Future<bool> updateRequestStatus({
    required String requestId,
    required String status,
  }) async {
    _errorMessage = null;
    
    try {
      await _supabaseService.updateRequestStatus(
        requestId: requestId,
        status: status,
      );
      // Reload requests after update
      await loadAllRequests();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Subscribe to teacher's requests (Real-time)
  void subscribeToTeacherRequests(String teacherId) {
    _subscription?.unsubscribe();
    _subscription = _supabaseService.subscribeToTeacherRequests(
      teacherId: teacherId,
      onData: (requests) {
        _requests = requests;
        notifyListeners();
      },
    );
  }

  // Subscribe to all requests (Admin - Real-time)
  void subscribeToAllRequests() {
    _subscription?.unsubscribe();
    _subscription = _supabaseService.subscribeToAllRequests(
      onData: (requests) {
        _requests = requests;
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

  // Delete request
  Future<void> deleteRequest(String requestId) async {
    try {
      await _supabaseService.deleteAbsenceRequest(requestId);
      // Remove from local list
      _requests.removeWhere((r) => r.id == requestId);
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
