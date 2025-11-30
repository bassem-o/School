-- Add minutes column to delay_requests table
ALTER TABLE delay_requests 
ADD COLUMN IF NOT EXISTS minutes INTEGER DEFAULT 0;
