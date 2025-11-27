import 'package:flutter/material.dart';
import '../models/absence_request.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({
    Key? key,
    required this.status,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor = Colors.white;
    String displayText;

    switch (status.toLowerCase()) {
      case 'pending':
        backgroundColor = Colors.orange;
        displayText = 'قيد الانتظار';
        break;
      case 'approved':
        backgroundColor = Colors.green;
        displayText = 'موافق عليه';
        break;
      case 'rejected':
        backgroundColor = Colors.red;
        displayText = 'مرفوض';
        break;
      default:
        backgroundColor = Colors.grey;
        displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
