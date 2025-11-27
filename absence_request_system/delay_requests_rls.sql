-- ============================================
-- RLS Policies for delay_requests Table
-- ============================================
-- This SQL duplicates the RLS policies from absence_requests to delay_requests

-- Step 1: Enable Row Level Security on delay_requests
ALTER TABLE delay_requests ENABLE ROW LEVEL SECURITY;

-- Step 2: Create RLS Policies

--------------------------
-- Table: delay_requests
--------------------------

-- Teacher (role = "teacher")
-- INSERT: allowed only if teacher_id = auth.uid()
CREATE POLICY "Teachers can insert own delay requests"
  ON delay_requests FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- SELECT: allowed only where teacher_id = auth.uid()
CREATE POLICY "Teachers can view own delay requests"
  ON delay_requests FOR SELECT
  USING (teacher_id = auth.uid());

-- UPDATE/DELETE: denied (No policy needed, default is deny)

-- Admin (role = "admin")
-- SELECT: all rows
CREATE POLICY "Admins can view all delay requests"
  ON delay_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- UPDATE: allowed only for admins (to update status)
CREATE POLICY "Admins can update delay requests"
  ON delay_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- DELETE: denied (No policy needed)

-- Step 3: Enable Realtime for delay_requests
ALTER PUBLICATION supabase_realtime ADD TABLE delay_requests;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delay_requests_teacher_id ON delay_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_delay_requests_status ON delay_requests(status);
CREATE INDEX IF NOT EXISTS idx_delay_requests_date ON delay_requests(date DESC);
