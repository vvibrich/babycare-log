-- Create records table
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('symptom', 'medication')),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);

-- Enable Row Level Security (RLS)
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since there's no authentication)
CREATE POLICY "Allow all operations on records" ON records
  FOR ALL
  USING (true)
  WITH CHECK (true);
