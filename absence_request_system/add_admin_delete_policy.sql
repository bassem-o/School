-- Add DELETE policy for admins to delete absence requests
-- This allows admins to delete requests from both new requests and history views

CREATE POLICY "Admins can delete requests"
  ON absence_requests FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
