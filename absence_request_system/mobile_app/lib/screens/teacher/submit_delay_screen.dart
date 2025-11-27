import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/delays_provider.dart';
import '../../providers/requests_provider.dart';

class SubmitDelayScreen extends StatefulWidget {
  const SubmitDelayScreen({Key? key}) : super(key: key);

  @override
  State<SubmitDelayScreen> createState() => _SubmitDelayScreenState();
}

class _SubmitDelayScreenState extends State<SubmitDelayScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final authProvider = context.read<AuthProvider>();
    final delaysProvider = context.read<DelaysProvider>();
    final requestsProvider = context.read<RequestsProvider>();
    
    // Ensure we have teacher details
    if (requestsProvider.teacherDetails == null) {
      await requestsProvider.loadTeacherDetails(authProvider.currentUser!.id);
      if (requestsProvider.teacherDetails == null) {
        setState(() {
          _isSubmitting = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('تعذر تحميل بيانات المعلم'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }
    }

    final success = await delaysProvider.submitDelayRequest(
      teacherId: authProvider.currentUser!.id,
      teacherName: authProvider.currentUser!.name,
      subject: requestsProvider.teacherDetails!.subject,
      classes: requestsProvider.teacherDetails!.classes,
      reason: _reasonController.text.trim(),
    );

    setState(() {
      _isSubmitting = false;
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم تقديم طلب التأخير بنجاح'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('فشل تقديم الطلب: ${delaysProvider.errorMessage}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('تقديم طلب تأخير', style: TextStyle(color: Colors.white)),
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
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Container(
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
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Info Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.orange.shade100),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.access_time, color: Colors.orange.shade700),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text(
                                'الرجاء كتابة سبب التأخير بوضوح',
                                style: TextStyle(fontSize: 14, color: Colors.black87),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Reason Field
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'سبب التأخير',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF333333),
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _reasonController,
                            maxLines: 6,
                            textDirection: TextDirection.rtl,
                            decoration: InputDecoration(
                              hintText: 'اكتب سبب التأخير هنا...',
                              alignLabelWithHint: true,
                              contentPadding: const EdgeInsets.all(16),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFDDDDDD), width: 2),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFDDDDDD), width: 2),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFF667EEA), width: 2),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'الرجاء إدخال سبب التأخير';
                              }
                              if (value.trim().length < 10) {
                                return 'السبب يجب أن يكون 10 أحرف على الأقل';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      
                      // Submit Button
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFF667EEA),
                              Color(0xFF764BA2),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF667EEA).withOpacity(0.4),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'تقديم الطلب',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
