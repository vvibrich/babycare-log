-- Add medical and personal information fields to children table
-- These fields are useful for parents to track and for medical professionals

-- Add new columns to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2), -- Weight in kilograms (e.g., 12.50)
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2), -- Height in centimeters (e.g., 85.50)
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')),
ADD COLUMN IF NOT EXISTS allergies TEXT, -- Known allergies (free text)
ADD COLUMN IF NOT EXISTS medical_conditions TEXT, -- Pre-existing medical conditions (free text)
ADD COLUMN IF NOT EXISTS ongoing_medications TEXT, -- Current continuous medications (free text)
ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255), -- Pediatrician/doctor name
ADD COLUMN IF NOT EXISTS doctor_phone VARCHAR(50), -- Doctor's contact phone
ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100), -- Health insurance number
ADD COLUMN IF NOT EXISTS notes TEXT, -- General notes about the child
ADD COLUMN IF NOT EXISTS last_weight_update TIMESTAMPTZ, -- When weight was last updated
ADD COLUMN IF NOT EXISTS last_height_update TIMESTAMPTZ; -- When height was last updated

-- Add comment explaining the new fields
COMMENT ON COLUMN children.sex IS 'Child biological sex or gender identity';
COMMENT ON COLUMN children.weight_kg IS 'Current weight in kilograms';
COMMENT ON COLUMN children.height_cm IS 'Current height in centimeters';
COMMENT ON COLUMN children.blood_type IS 'Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-, unknown)';
COMMENT ON COLUMN children.allergies IS 'Known allergies (medications, foods, etc.)';
COMMENT ON COLUMN children.medical_conditions IS 'Pre-existing medical conditions or chronic diseases';
COMMENT ON COLUMN children.ongoing_medications IS 'Current continuous medications';
COMMENT ON COLUMN children.doctor_name IS 'Primary pediatrician or doctor name';
COMMENT ON COLUMN children.doctor_phone IS 'Doctor contact phone number';
COMMENT ON COLUMN children.insurance_number IS 'Health insurance policy number';
COMMENT ON COLUMN children.notes IS 'General notes about the child';
COMMENT ON COLUMN children.last_weight_update IS 'Timestamp of last weight measurement';
COMMENT ON COLUMN children.last_height_update IS 'Timestamp of last height measurement';

-- Create index for faster querying by sex (useful for statistics)
CREATE INDEX IF NOT EXISTS idx_children_sex ON children(sex);

-- Add constraint to ensure weight and height are positive numbers
ALTER TABLE children
ADD CONSTRAINT check_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0),
ADD CONSTRAINT check_height_positive CHECK (height_cm IS NULL OR height_cm > 0);
