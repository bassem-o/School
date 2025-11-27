import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requests_provider.dart';
import '../../widgets/request_card.dart';

class MyRequestsScreen extends StatefulWidget {
  const MyRequestsScreen({Key? key}) : super(key: key);

  @override
  State<MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends State<MyRequestsScreen> {
  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    final authProvider = context.read<AuthProvider>();
    final requestsProvider = context.read<RequestsProvider>();
    final teacherId = authProvider.currentUser!.id;
    
    // Load initial data
    await requestsProvider.loadTeacherRequests(teacherId);
    
    // Subscribe to real-time updates
    requestsProvider.subscribeToTeacherRequests(teacherId);
  }

  @override
  void dispose() {
    // Unsubscribe when leaving the screen
    context.read<RequestsProvider>().unsubscribe();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('طلباتي', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF667EEA),
                    Color(0xFF764BA2),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Consumer<RequestsProvider>(
              builder: (context, requestsProvider, child) {
                if (requestsProvider.isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  );
                }

                if (requestsProvider.errorMessage != null) {
                  return Center(
                    child: Container(
                      margin: const EdgeInsets.all(24),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
                          const SizedBox(height: 16),
                          Text(
                            'حدث خطأ',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.grey.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            requestsProvider.errorMessage!,
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loadRequests,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF667EEA),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                if (requestsProvider.requests.isEmpty) {
                  return Center(
                    child: Container(
                      margin: const EdgeInsets.all(24),
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.inbox, size: 64, color: Colors.white70),
                          const SizedBox(height: 16),
                          const Text(
                            'لا توجد طلبات',
                            style: TextStyle(
                              fontSize: 20,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'لم تقم بتقديم أي طلبات بعد',
                            style: TextStyle(color: Colors.white70),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _loadRequests,
                  color: const Color(0xFF667EEA),
                  backgroundColor: Colors.white,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    itemCount: requestsProvider.requests.length,
                    itemBuilder: (context, index) {
                      final request = requestsProvider.requests[index];
                      return RequestCard(
                        request: request,
                        showTeacherName: false,
                        onDelete: () async {
                          try {
                            await requestsProvider.deleteRequest(request.id);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('تم حذف الطلب بنجاح'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('فشل حذف الطلب: $e'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          }
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
