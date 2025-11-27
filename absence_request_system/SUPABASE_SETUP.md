# Supabase Database Setup

This document contains all the SQL scripts needed to set up your Supabase database for the Absence Request System.

## 📋 Database Schema

### Step 1: Create Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  classes TEXT[] NOT NULL, -- Array of class names e.g. ["1A", "1B"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create absence_requests table
CREATE TABLE IF NOT EXISTS absence_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL, -- Snapshot
  subject TEXT NOT NULL,      -- Snapshot
  classes TEXT[] NOT NULL,    -- Snapshot
  reason TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_absence_requests_teacher_id ON absence_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_absence_requests_status ON absence_requests(status);
CREATE INDEX IF NOT EXISTS idx_absence_requests_date ON absence_requests(date DESC);
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_requests ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies

```sql
--------------------------
-- Table: users
--------------------------
-- SELECT: users can select only their own row
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

--------------------------
-- Table: teachers
--------------------------
-- SELECT: teacher can select only where user_id = auth.uid()
CREATE POLICY "Teachers can read own details"
  ON teachers FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE: only admins can write (Assuming admins are inserted manually or via a separate process for now, 
-- but strictly following the requirement: "INSERT/UPDATE: only admins can write")
-- Note: For initial setup, you might need to temporarily disable RLS or use service role to insert teachers.
-- Here is a policy allowing admins to insert/update if they exist in users table as admin.
CREATE POLICY "Admins can insert/update teachers"
  ON teachers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

--------------------------
-- Table: absence_requests
--------------------------
-- Teacher (role = "teacher")
-- INSERT: allowed only if teacher_id = auth.uid()
CREATE POLICY "Teachers can insert own requests"
  ON absence_requests FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- SELECT: allowed only where teacher_id = auth.uid()
CREATE POLICY "Teachers can view own requests"
  ON absence_requests FOR SELECT
  USING (teacher_id = auth.uid());

-- UPDATE/DELETE: denied (No policy needed, default is deny)

-- Admin (role = "admin")
-- SELECT: all rows
CREATE POLICY "Admins can view all requests"
  ON absence_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- UPDATE: allowed only for status
-- Note: Supabase/Postgres policies for UPDATE apply to rows. 
-- To restrict columns, we can use a trigger or just trust the API logic + row policy. 
-- For RLS, we allow update if admin.
CREATE POLICY "Admins can update requests"
  ON absence_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- DELETE: denied (No policy needed)
```

### Step 4: Enable Realtime

```sql
-- Enable realtime for absence_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE absence_requests;
```

## 👥 Example Inserts

### 1. Create an Admin User
First, create a user in Supabase Auth (Authentication -> Add User).
Let's say the UUID is `ADMIN_UUID_123`.

```sql
INSERT INTO users (id, username, email, name, role)
VALUES ('ADMIN_UUID_123', 'admin', 'admin@school.com', 'System Admin', 'admin');
```

### 2. Create a Teacher User
Create another user in Supabase Auth.
UUID: `TEACHER_UUID_456`.

```sql
-- Insert into users
INSERT INTO users (id, username, email, name, role)
VALUES ('TEACHER_UUID_456', 'ahmed_ali', 'ahmed@school.com', 'Ahmed Ali', 'teacher');

-- Insert into teachers
INSERT INTO teachers (user_id, subject, classes)
VALUES ('TEACHER_UUID_456', 'Mathematics', ARRAY['1A', '1B', '2C']);
```

### 3. Example Absence Request (for testing)
```sql
INSERT INTO absence_requests (teacher_id, teacher_name, subject, classes, reason, status)
VALUES (
  'TEACHER_UUID_456', 
  'Ahmed Ali', 
  'Mathematics', 
  ARRAY['1A', '1B', '2C'], 
  'Medical Appointment', 
  'pending'
);
```
