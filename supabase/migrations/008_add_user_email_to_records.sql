-- Add user email to records view
-- This allows querying records with user email information

-- Create a function to get user email by user_id
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$;

-- Create a view that includes user email
CREATE OR REPLACE VIEW records_with_user AS
SELECT 
  r.*,
  get_user_email(r.user_id) as user_email
FROM records r;

-- Grant access to the view
GRANT SELECT ON records_with_user TO authenticated;

-- Enable RLS on the view
ALTER VIEW records_with_user SET (security_invoker = true);
