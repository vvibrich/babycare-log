-- Add incidents table and link records to incidents
-- This allows grouping related symptoms and medications into incidents

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add incident_id to records table (optional, can be null for standalone records)
ALTER TABLE records
ADD COLUMN incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_incidents_child_id ON incidents(child_id);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_records_incident_id ON records(incident_id);

-- Enable RLS on incidents table
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view incidents of children they have access to
CREATE POLICY "Users can view accessible incidents"
  ON incidents FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT child_id FROM child_access 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

-- Policy: Users can create incidents for their children
CREATE POLICY "Users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT child_id FROM child_access 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

-- Policy: Users can update their own incidents or incidents of shared children
CREATE POLICY "Users can update incidents"
  ON incidents FOR UPDATE
  USING (
    user_id = auth.uid() OR
    child_id IN (
      SELECT child_id FROM child_access 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Policy: Users can delete their own incidents
CREATE POLICY "Users can delete own incidents"
  ON incidents FOR DELETE
  USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_timestamp
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incidents_updated_at();

-- Grant access
GRANT ALL ON incidents TO authenticated;
