-- Add symptom_type and temperature columns to records table
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS symptom_type TEXT,
ADD COLUMN IF NOT EXISTS temperature NUMERIC(4,2);

-- Add check constraint for valid symptom types
ALTER TABLE records 
ADD CONSTRAINT check_symptom_type 
CHECK (
  symptom_type IS NULL OR 
  symptom_type IN (
    'febre', 
    'tosse', 
    'congestao_nasal', 
    'diarreia', 
    'vomito', 
    'dor_cabeca', 
    'dor_barriga', 
    'irritacao', 
    'falta_apetite', 
    'outro'
  )
);

-- Add check constraint for reasonable temperature values
ALTER TABLE records 
ADD CONSTRAINT check_temperature_range 
CHECK (temperature IS NULL OR (temperature >= 35 AND temperature <= 42));

-- Create index for symptom_type for faster queries
CREATE INDEX IF NOT EXISTS idx_records_symptom_type ON records(symptom_type);

-- Add comment
COMMENT ON COLUMN records.symptom_type IS 'Type of symptom: febre, tosse, congestao_nasal, etc.';
COMMENT ON COLUMN records.temperature IS 'Temperature in Celsius (for fever symptoms)';
