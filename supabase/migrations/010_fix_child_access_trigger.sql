-- Fix: Automatically add owner to child_access when creating a new child
-- This ensures RLS policies work correctly for new children

-- Create function to add owner access automatically
CREATE OR REPLACE FUNCTION add_owner_to_child_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert owner access for the user who created the child
  INSERT INTO child_access (child_id, user_id, role, granted_by)
  VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id)
  ON CONFLICT (child_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after child insert
DROP TRIGGER IF EXISTS add_owner_access_trigger ON children;
CREATE TRIGGER add_owner_access_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_child_access();

-- Fix existing children without access (run once)
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT 
  c.id as child_id,
  c.user_id,
  'owner' as role,
  c.user_id as granted_by
FROM children c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM child_access ca 
    WHERE ca.child_id = c.id 
    AND ca.user_id = c.user_id
  )
ON CONFLICT (child_id, user_id) DO NOTHING;
