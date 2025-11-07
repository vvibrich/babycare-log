-- Add medication reminder fields to records table
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS reminder_interval_hours INTEGER,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS next_dose_at TIMESTAMPTZ;

-- Create index for faster queries on reminders
CREATE INDEX IF NOT EXISTS idx_records_next_dose ON records(next_dose_at) 
  WHERE reminder_enabled = TRUE AND type = 'medication';

CREATE INDEX IF NOT EXISTS idx_records_reminder_enabled ON records(reminder_enabled) 
  WHERE reminder_enabled = TRUE;

-- Add comments
COMMENT ON COLUMN records.reminder_interval_hours IS 'Interval in hours between medication doses (e.g., 6 for every 6 hours)';
COMMENT ON COLUMN records.reminder_enabled IS 'Whether reminder is active for this medication';
COMMENT ON COLUMN records.next_dose_at IS 'Calculated timestamp for next dose';

-- Function to calculate next dose
CREATE OR REPLACE FUNCTION calculate_next_dose()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'medication' AND NEW.reminder_enabled = TRUE AND NEW.reminder_interval_hours IS NOT NULL THEN
    NEW.next_dose_at := NEW.created_at + (NEW.reminder_interval_hours || ' hours')::interval;
  ELSE
    NEW.next_dose_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate next dose on insert
CREATE TRIGGER set_next_dose_on_insert
  BEFORE INSERT ON records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_next_dose();

-- Trigger to auto-calculate next dose on update
CREATE TRIGGER set_next_dose_on_update
  BEFORE UPDATE ON records
  FOR EACH ROW
  WHEN (NEW.reminder_enabled = TRUE OR OLD.reminder_enabled = TRUE)
  EXECUTE FUNCTION calculate_next_dose();
