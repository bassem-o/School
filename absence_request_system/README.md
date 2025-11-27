# Absence Request System

A complete mobile and web application for managing teacher absence requests in a school environment.

## 📋 Overview

This system allows teachers to submit absence requests through a mobile app, while administrators can review and approve/reject these requests through a web dashboard. All data is managed through Supabase with real-time updates and Row Level Security (RLS).

## 🏗️ Architecture

### Frontend
- **Mobile App**: Flutter (iOS & Android)
- **Admin Dashboard**: React with Vite

### Backend
- **Supabase**: Authentication, PostgreSQL Database, Real-time subscriptions, RLS

### State Management
- **Flutter**: Provider pattern
- **React**: Custom hooks (useAuth, useRequests)

## 📁 Project Structure

```
absence_request_system/
├── mobile_app/              # Flutter mobile application
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/          # Data models
│   │   ├── services/        # Supabase & Auth services
│   │   ├── providers/       # State management
│   │   ├── screens/         # UI screens
│   │   ├── widgets/         # Reusable components
│   │   └── config/          # Environment config
│   ├── pubspec.yaml
│   └── .env                 # Supabase credentials
│
└── admin_dashboard/         # React web application
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/      # React components
    │   ├── hooks/           # Custom hooks
    │   ├── services/        # Supabase services
    │   └── styles/          # CSS styles
    ├── package.json
    └── .env                 # Supabase credentials
```

## 🚀 Getting Started

### Prerequisites

1. **Flutter SDK** (for mobile app)
   - Download from: https://flutter.dev/docs/get-started/install
   - Verify installation: `flutter doctor`

2. **Node.js & npm** (for admin dashboard)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

3. **Supabase Account**
   - Already configured with URL: `https://wpcoodpgktpmejzqohwq.supabase.co`

### Database Setup

Run the following SQL in your Supabase SQL Editor to create the database schema and RLS policies:

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed SQL scripts.

## 📱 Mobile App Setup

### Installation

```bash
cd mobile_app

# Install dependencies
flutter pub get

# Run on connected device or emulator
flutter run
```

### Build APK (Android)

```bash
# Build release APK
flutter build apk --release

# APK will be located at:
# build/app/outputs/flutter-apk/app-release.apk
```

### Build for iOS

```bash
# Build iOS app (requires macOS and Xcode)
flutter build ios --release
```

### Environment Configuration

The `.env` file is already configured with your Supabase credentials:
- URL: `https://wpcoodpgktpmejzqohwq.supabase.co`
- Anon Key: (configured)

## 🌐 Admin Dashboard Setup

### Installation

```bash
cd admin_dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

### Deployment

The `dist/` folder can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Configure in repository settings
- **Supabase Hosting**: `supabase deploy`

## 👥 User Roles

### Teacher
- Login with email/password
- View personalized home screen
- Submit absence requests with reasons
- View their own requests with real-time status updates
- See status badges (Pending/Approved/Rejected)

### Admin
- Login with email/password
- View all absence requests from all teachers
- See teacher names for each request
- Approve or reject requests via dropdown
- Real-time updates when new requests are submitted

## 🔒 Security

### Row Level Security (RLS) Policies

**Teachers:**
- Can only SELECT their own requests (`teacher_id = auth.uid()`)
- Can only INSERT requests for themselves
- Cannot UPDATE or DELETE requests

**Admins:**
- Full access to all requests (SELECT, INSERT, UPDATE, DELETE)
- Can update request status

### Authentication
- All users authenticate via Supabase Auth (email/password)
- User roles are stored in the `profiles` table
- RLS policies automatically enforce permissions based on `auth.uid()`

## 🗄️ Database Schema

### Table: `profiles`
```sql
- id: uuid (PK, references auth.users)
- name: text
- role: text ("teacher" or "admin")
```

### Table: `absence_requests`
```sql
- id: uuid (PK)
- teacher_id: uuid (FK to profiles.id)
- reason: text
- created_at: timestamptz
- status: text ("pending", "approved", "rejected")
```

## 🔄 Real-time Features

Both applications use Supabase real-time subscriptions:

- **Teacher App**: Automatically updates when admin changes request status
- **Admin Dashboard**: Automatically shows new requests as they're submitted
- No manual refresh needed

## 🌍 Internationalization

- **Language**: Arabic (RTL layout)
- **Direction**: Right-to-Left throughout both apps
- **Date Format**: Arabic locale formatting

## 🧪 Testing

### Test Users

You'll need to create test users in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Create users with email/password
3. Add corresponding entries in the `profiles` table with roles

**Example:**
```sql
-- After creating user in Auth, add profile
INSERT INTO profiles (id, name, role)
VALUES 
  ('user-uuid-from-auth', 'أحمد محمد', 'teacher'),
  ('admin-uuid-from-auth', 'مدير النظام', 'admin');
```

### Testing Workflow

1. **Teacher Flow:**
   - Login as teacher
   - Submit absence request
   - View in "My Requests"
   - Verify status updates in real-time

2. **Admin Flow:**
   - Login as admin
   - See all requests
   - Update status to "approved" or "rejected"
   - Verify teacher sees the update

## 📝 Development Notes

### Flutter Dependencies
- `supabase_flutter: ^2.0.0` - Supabase SDK
- `provider: ^6.1.0` - State management
- `flutter_dotenv: ^5.1.0` - Environment variables
- `intl: ^0.18.0` - Date formatting

### React Dependencies
- `react: ^18.2.0` - UI library
- `@supabase/supabase-js: ^2.38.0` - Supabase client
- `vite: ^5.0.8` - Build tool

## 🐛 Troubleshooting

### Flutter Issues

**"Flutter not found"**
- Ensure Flutter is installed and added to PATH
- Run `flutter doctor` to diagnose issues

**"Supabase connection failed"**
- Verify `.env` file exists in `mobile_app/` directory
- Check Supabase URL and key are correct

### React Issues

**"Module not found"**
- Run `npm install` in `admin_dashboard/` directory

**"Environment variables not loading"**
- Ensure `.env` file exists in `admin_dashboard/` directory
- Restart dev server after creating/modifying `.env`

## 📞 Support

For issues related to:
- **Supabase**: Check Supabase documentation at https://supabase.com/docs
- **Flutter**: Visit https://flutter.dev/docs
- **React**: Visit https://react.dev

## 📄 License

This project is for educational purposes.
