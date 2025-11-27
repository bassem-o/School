-- ============================================
-- Add DELETE Policies for Requests
-- ============================================
-- This script adds RLS policies to allow teachers to delete their own PENDING requests.

-- 1. Policy for absence_requests
CREATE POLICY "Teachers can delete own pending requests"
  ON absence_requests FOR DELETE
  USING (
    teacher_id = auth.uid() 
    AND status = 'pending'
  );

-- 2. Policy for delay_requests
CREATE POLICY "Teachers can delete own pending delay requests"
  ON delay_requests FOR DELETE
  USING (
    teacher_id = auth.uid() 
    AND status = 'pending'
  );

-- Verify policies
SELECT * FROM pg_policies WHERE tablename IN ('absence_requests', 'delay_requests');
