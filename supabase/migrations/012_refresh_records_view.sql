-- Recreate records_with_user view to include incident_id column
-- This is necessary because the view was created before incident_id was added to records table

-- Drop and recreate the view to ensure it includes all columns
DROP VIEW IF EXISTS records_with_user;

CREATE OR REPLACE VIEW records_with_user AS
SELECT 
  r.*,
  get_user_email(r.user_id) as user_email
FROM records r;

-- Grant access to the view
GRANT SELECT ON records_with_user TO authenticated;

-- Enable RLS on the view
ALTER VIEW records_with_user SET (security_invoker = true);

-- Add comment
COMMENT ON VIEW records_with_user IS 'View that includes user email and all record fields including incident_id';
