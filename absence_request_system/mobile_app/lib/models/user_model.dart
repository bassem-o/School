class UserModel {
  final String id;
  final String username;
  final String email;
  final String name;
  final String role;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.name,
    required this.role,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      name: json['name'],
      role: json['role'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'name': name,
      'role': role,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
