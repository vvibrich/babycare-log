-- Add 'temperatura' to symptom_type constraint
-- This allows the new temperature symptom type to be used

-- Drop the old constraint
ALTER TABLE records 
DROP CONSTRAINT IF EXISTS check_symptom_type;

-- Create new constraint with 'temperatura' included
ALTER TABLE records 
ADD CONSTRAINT check_symptom_type 
CHECK (
  symptom_type IS NULL OR 
  symptom_type IN (
    'temperatura',  -- NEW: Generic temperature field
    'febre',        -- LEGACY: Kept for compatibility
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

-- Update comment to reflect the change
COMMENT ON COLUMN records.symptom_type IS 'Type of symptom: temperatura (new), febre (legacy), tosse, congestao_nasal, etc.';
