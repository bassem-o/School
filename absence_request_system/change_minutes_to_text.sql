-- Change minutes column from INTEGER to TEXT to support both numeric values and "اذن يومى"
-- This allows storing both numbers (as text) and the special value "اذن يومى"

ALTER TABLE delay_requests 
ALTER COLUMN minutes TYPE TEXT USING minutes::TEXT;

-- Update existing NULL values to empty string if needed
UPDATE delay_requests 
SET minutes = '0' 
WHERE minutes IS NULL OR minutes = '';
