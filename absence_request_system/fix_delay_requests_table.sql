-- ============================================
-- Update delay_requests Table Schema
-- ============================================
-- This SQL ensures the delay_requests table has the correct schema
-- with subject and classes columns

-- If you need to add the columns (they don't exist yet):
ALTER TABLE delay_requests 
  ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS classes TEXT[] NOT NULL DEFAULT '{}';

-- If the columns exist but you want to make sure they're NOT NULL:
-- (Run this after adding data or setting defaults)
/*
ALTER TABLE delay_requests 
  ALTER COLUMN subject SET NOT NULL,
  ALTER COLUMN classes SET NOT NULL;
*/

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'delay_requests'
ORDER BY ordinal_position;
