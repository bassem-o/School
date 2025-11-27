import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/absence_request.dart';

class RequestCard extends StatelessWidget {
  final AbsenceRequest request;
  final bool showTeacherName;
  final Widget? actionWidget;
  final VoidCallback? onDelete;

  const RequestCard({
    Key? key,
    required this.request,
    this.showTeacherName = false,
    this.actionWidget,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('yyyy/MM/dd - HH:mm', 'ar');
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with status badge, date, and delete button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _StatusBadge(status: request.status),
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          dateFormat.format(request.date),
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (onDelete != null && request.status == 'pending') ...[
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () => _showDeleteDialog(context),
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.delete_outline,
                                size: 18,
                                color: Colors.red.shade700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Teacher name (for admin view)
              if (showTeacherName) ...[
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.person, size: 16, color: Colors.blue.shade700),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      request.teacherName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF333333),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              
              // Subject
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.book, size: 16, color: Colors.blue.shade700),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    request.subject,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF333333),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Classes
              if (request.classes.isNotEmpty) ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.class_, size: 16, color: Colors.green.shade700),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: request.classes.map((className) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.green.shade200),
                            ),
                            child: Text(
                              className,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.green.shade700,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              
              // Reason
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.description, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 8),
                        Text(
                          'سبب الغياب:',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      request.reason,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF333333),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Action widget (for admin - status buttons)
              if (actionWidget != null) ...[
                const SizedBox(height: 16),
                actionWidget!,
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الطلب'),
        content: const Text('هل أنت متأكد من حذف هذا الطلب؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onDelete?.call();
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    String text;
    IconData icon;

    switch (status) {
      case 'approved':
        backgroundColor = Colors.green.shade50;
        textColor = Colors.green.shade700;
        text = 'موافق عليه';
        icon = Icons.check_circle;
        break;
      case 'rejected':
        backgroundColor = Colors.red.shade50;
        textColor = Colors.red.shade700;
        text = 'مرفوض';
        icon = Icons.cancel;
        break;
      default:
        backgroundColor = Colors.orange.shade50;
        textColor = Colors.orange.shade700;
        text = 'قيد المراجعة';
        icon = Icons.pending;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
