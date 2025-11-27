import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requests_provider.dart';
import '../../widgets/request_card.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    final requestsProvider = context.read<RequestsProvider>();
    
    // Load initial data
    await requestsProvider.loadAllRequests();
    
    // Subscribe to real-time updates
    requestsProvider.subscribeToAllRequests();
  }

  @override
  void dispose() {
    // Unsubscribe when leaving the screen
    context.read<RequestsProvider>().unsubscribe();
    super.dispose();
  }

  Future<void> _updateStatus(String requestId, String newStatus) async {
    final requestsProvider = context.read<RequestsProvider>();
    final success = await requestsProvider.updateRequestStatus(
      requestId: requestId,
      status: newStatus,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم تحديث حالة الطلب'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(requestsProvider.errorMessage ?? 'فشل تحديث الحالة'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة التحكم - الإدارة'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.signOut();
            },
            tooltip: 'تسجيل الخروج',
          ),
        ],
      ),
      body: Consumer<RequestsProvider>(
        builder: (context, requestsProvider, child) {
          if (requestsProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (requestsProvider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
                  const SizedBox(height: 16),
                  Text(
                    'حدث خطأ',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      requestsProvider.errorMessage!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadRequests,
                    child: const Text('إعادة المحاولة'),
                  ),
                ],
              ),
            );
          }

          if (requestsProvider.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text(
                    'لا توجد طلبات',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadRequests,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 16),
              itemCount: requestsProvider.requests.length,
              itemBuilder: (context, index) {
                final request = requestsProvider.requests[index];
                
                return RequestCard(
                  request: request,
                  showTeacherName: true,
                  actionWidget: request.status == 'pending'
                      ? Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _updateStatus(request.id, 'approved'),
                                icon: const Icon(Icons.check_circle, size: 18),
                                label: const Text('موافقة'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _updateStatus(request.id, 'rejected'),
                                icon: const Icon(Icons.cancel, size: 18),
                                label: const Text('رفض'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                          ],
                        )
                      : null,
                );
              },
            ),
          );
        },
      ),
    );
  }
}
