-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Add child_id to records table
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_records_child_id ON records(child_id);
CREATE INDEX IF NOT EXISTS idx_children_active ON children(is_active);

-- Enable Row Level Security on children table
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on children (since there's no authentication)
CREATE POLICY "Allow all operations on children" ON children
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE children IS 'Table to store information about children';
COMMENT ON COLUMN children.name IS 'Child name';
COMMENT ON COLUMN children.birth_date IS 'Date of birth';
COMMENT ON COLUMN children.photo_url IS 'URL or path to child photo';
COMMENT ON COLUMN children.is_active IS 'Whether this child profile is active';
COMMENT ON COLUMN records.child_id IS 'Reference to the child this record belongs to';

-- Create a default child for existing records (optional - for migration)
-- This can be run manually after migration if needed
-- INSERT INTO children (name, is_active) VALUES ('Primeira Criança', TRUE);
