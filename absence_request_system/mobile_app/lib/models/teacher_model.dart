class TeacherModel {
  final String userId;
  final String subject;
  final List<String> classes;
  final DateTime createdAt;

  TeacherModel({
    required this.userId,
    required this.subject,
    required this.classes,
    required this.createdAt,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) {
    return TeacherModel(
      userId: json['user_id'],
      subject: json['subject'],
      classes: List<String>.from(json['classes']),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'subject': subject,
      'classes': classes,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
