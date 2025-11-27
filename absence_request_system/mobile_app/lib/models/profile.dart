class Profile {
  final String id;
  final String name;
  final String role;

  Profile({
    required this.id,
    required this.name,
    required this.role,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
    };
  }

  bool get isTeacher => role == 'teacher';
  bool get isAdmin => role == 'admin';
}
