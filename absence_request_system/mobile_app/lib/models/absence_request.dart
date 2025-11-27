class AbsenceRequest {
  final String id;
  final String teacherId;
  final String teacherName;
  final String subject;
  final List<String> classes;
  final String reason;
  final String status;
  final DateTime date;

  AbsenceRequest({
    required this.id,
    required this.teacherId,
    required this.teacherName,
    required this.subject,
    required this.classes,
    required this.reason,
    required this.status,
    required this.date,
  });

  factory AbsenceRequest.fromJson(Map<String, dynamic> json) {
    return AbsenceRequest(
      id: json['id'],
      teacherId: json['teacher_id'],
      teacherName: json['teacher_name'],
      subject: json['subject'],
      classes: List<String>.from(json['classes']),
      reason: json['reason'],
      status: json['status'],
      date: DateTime.parse(json['date']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'teacher_id': teacherId,
      'teacher_name': teacherName,
      'subject': subject,
      'classes': classes,
      'reason': reason,
      'status': status,
      'date': date.toIso8601String(),
    };
  }
}
