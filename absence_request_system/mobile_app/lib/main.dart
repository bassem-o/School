import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'config/env_config.dart';
import 'providers/auth_provider.dart';
import 'providers/requests_provider.dart';
import 'providers/delays_provider.dart';
import 'screens/login_screen.dart';
import 'screens/teacher/teacher_home_screen.dart';
import 'screens/admin/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Supabase
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RequestsProvider()),
        ChangeNotifierProvider(create: (_) => DelaysProvider()),
      ],
      child: MaterialApp(
        title: 'نظام طلبات الغياب',
        debugShowCheckedModeBanner: false,
        
        // RTL Configuration
        locale: const Locale('ar', 'SA'),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('ar', 'SA'),
        ],
        
        // Theme
        theme: ThemeData(
          primarySwatch: Colors.blue,
          fontFamily: 'Arial',
          textTheme: const TextTheme(
            bodyLarge: TextStyle(fontSize: 16),
            bodyMedium: TextStyle(fontSize: 14),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              textStyle: const TextStyle(fontSize: 16),
            ),
          ),
        ),
        
        // Home
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final authProvider = context.read<AuthProvider>();
    if (Supabase.instance.client.auth.currentUser != null) {
      await authProvider.loadUserProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Show loading while checking auth
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // Not logged in - show login screen
        if (!authProvider.isLoggedIn) {
          return const LoginScreen();
        }

        // Logged in - route based on role
        if (authProvider.isTeacher) {
          return const TeacherHomeScreen();
        } else if (authProvider.isAdmin) {
          return const AdminDashboardScreen();
        }

        // Unknown role - show error
        return Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                const Text('دور المستخدم غير معروف'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => authProvider.signOut(),
                  child: const Text('تسجيل الخروج'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
