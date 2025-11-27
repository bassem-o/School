import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/absence_request.dart';
import '../models/delay_request.dart';
import '../models/teacher_model.dart';

class SupabaseService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get teacher details
  Future<TeacherModel?> getTeacherDetails(String userId) async {
    try {
      final response = await _supabase
          .from('teachers')
          .select()
          .eq('user_id', userId)
          .single();
      return TeacherModel.fromJson(response);
    } catch (e) {
      // Handle case where teacher details might not exist yet
      return null;
    }
  }

  // Submit absence request (Teacher only)
  Future<void> submitAbsenceRequest({
    required String teacherId,
    required String teacherName,
    required String subject,
    required List<String> classes,
    required String reason,
  }) async {
    await _supabase.from('absence_requests').insert({
      'teacher_id': teacherId,
      'teacher_name': teacherName,
      'subject': subject,
      'classes': classes,
      'reason': reason,
      'status': 'pending',
      'date': DateTime.now().toIso8601String(),
    });
  }

  // Get teacher's own requests (RLS enforced)
  Future<List<AbsenceRequest>> getTeacherRequests(String teacherId) async {
    final response = await _supabase
        .from('absence_requests')
        .select()
        .eq('teacher_id', teacherId)
        .order('date', ascending: false);

    return (response as List)
        .map((json) => AbsenceRequest.fromJson(json))
        .toList();
  }

  // Get all requests (Admin only - RLS enforced)
  Future<List<AbsenceRequest>> getAllRequests() async {
    final response = await _supabase
        .from('absence_requests')
        .select()
        .order('date', ascending: false);

    return (response as List)
        .map((json) => AbsenceRequest.fromJson(json))
        .toList();
  }

  // Update request status (Admin only - RLS enforced)
  Future<void> updateRequestStatus({
    required String requestId,
    required String status,
  }) async {
    await _supabase
        .from('absence_requests')
        .update({'status': status})
        .eq('id', requestId);
  }

  // Subscribe to teacher's requests (Real-time)
  RealtimeChannel subscribeToTeacherRequests({
    required String teacherId,
    required Function(List<AbsenceRequest>) onData,
  }) {
    final channel = _supabase
        .channel('teacher_requests_$teacherId')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'absence_requests',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'teacher_id',
            value: teacherId,
          ),
          callback: (payload) async {
            // Refetch all requests when any change occurs
            final requests = await getTeacherRequests(teacherId);
            onData(requests);
          },
        )
        .subscribe();

    return channel;
  }

  // Subscribe to all requests (Admin - Real-time)
  RealtimeChannel subscribeToAllRequests({
    required Function(List<AbsenceRequest>) onData,
  }) {
    final channel = _supabase
        .channel('all_requests')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'absence_requests',
          callback: (payload) async {
            // Refetch all requests when any change occurs
            final requests = await getAllRequests();
            onData(requests);
          },
        )
        .subscribe();

    return channel;
  }

  // ==================== DELAY REQUESTS ====================

  // Submit delay request (Teacher only)
  Future<void> submitDelayRequest({
    required String teacherId,
    required String teacherName,
    required String subject,
    required List<String> classes,
    required String reason,
  }) async {
    await _supabase.from('delay_requests').insert({
      'teacher_id': teacherId,
      'teacher_name': teacherName,
      'subject': subject,
      'classes': classes,
      'reason': reason,
      'status': 'pending',
      'date': DateTime.now().toIso8601String(),
    });
  }

  // Get teacher's own delay requests (RLS enforced)
  Future<List<DelayRequest>> getTeacherDelayRequests(String teacherId) async {
    final response = await _supabase
        .from('delay_requests')
        .select()
        .eq('teacher_id', teacherId)
        .order('date', ascending: false);

    return (response as List)
        .map((json) => DelayRequest.fromJson(json))
        .toList();
  }

  // Get all delay requests (Admin only - RLS enforced)
  Future<List<DelayRequest>> getAllDelayRequests() async {
    final response = await _supabase
        .from('delay_requests')
        .select()
        .order('date', ascending: false);

    return (response as List)
        .map((json) => DelayRequest.fromJson(json))
        .toList();
  }

  // Update delay request status (Admin only - RLS enforced)
  Future<void> updateDelayStatus({
    required String requestId,
    required String status,
  }) async {
    await _supabase
        .from('delay_requests')
        .update({'status': status})
        .eq('id', requestId);
  }

  // Subscribe to teacher's delay requests (Real-time)
  RealtimeChannel subscribeToTeacherDelayRequests({
    required String teacherId,
    required Function(List<DelayRequest>) onData,
  }) {
    final channel = _supabase
        .channel('teacher_delays_$teacherId')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'delay_requests',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'teacher_id',
            value: teacherId,
          ),
          callback: (payload) async {
            // Refetch all delay requests when any change occurs
            final requests = await getTeacherDelayRequests(teacherId);
            onData(requests);
          },
        )
        .subscribe();

    return channel;
  }

  // Subscribe to all delay requests (Admin - Real-time)
  RealtimeChannel subscribeToAllDelayRequests({
    required Function(List<DelayRequest>) onData,
  }) {
    final channel = _supabase
        .channel('all_delays')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'delay_requests',
          callback: (payload) async {
            // Refetch all delay requests when any change occurs
            final requests = await getAllDelayRequests();
            onData(requests);
          },
        )
        .subscribe();

    return channel;
  }

  // Delete absence request (Teacher only - pending requests)
  Future<void> deleteAbsenceRequest(String requestId) async {
    await _supabase
        .from('absence_requests')
        .delete()
        .eq('id', requestId);
  }

  // Delete delay request (Teacher only - pending requests)
  Future<void> deleteDelayRequest(String requestId) async {
    await _supabase
        .from('delay_requests')
        .delete()
        .eq('id', requestId);
  }
}
