-- Add absence_left column to teachers table
-- This column tracks how many absence days a teacher has remaining (out of 7)

-- Step 1: Add the column with default value of 7
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS absence_left INTEGER NOT NULL DEFAULT 7;

-- Step 2: Create a function to decrement absence_left when a request is approved
CREATE OR REPLACE FUNCTION decrement_absence_days()
RETURNS TRIGGER AS $$
BEGIN
    -- Only decrement if status changed from 'pending' to 'approved'
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        -- Decrement the teacher's absence_left by 1 (but don't go below 0)
        UPDATE teachers
        SET absence_left = GREATEST(absence_left - 1, 0)
        WHERE user_id = NEW.teacher_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger on absence_requests table
DROP TRIGGER IF EXISTS trigger_decrement_absence_days ON absence_requests;

CREATE TRIGGER trigger_decrement_absence_days
AFTER UPDATE ON absence_requests
FOR EACH ROW
EXECUTE FUNCTION decrement_absence_days();

-- Step 4: Add comment for documentation
COMMENT ON COLUMN teachers.absence_left IS 'Number of absence days remaining for the teacher (out of 7). Decrements automatically when absence request is approved.';
