-- Add name and commitment fields to mandalas table
-- Migration: Add name and commitment for Mandala chart display

-- Add columns only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mandalas' AND column_name = 'name'
  ) THEN
    ALTER TABLE mandalas ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mandalas' AND column_name = 'commitment'
  ) THEN
    ALTER TABLE mandalas ADD COLUMN commitment TEXT;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN mandalas.name IS 'User name displayed on Mandala chart';
COMMENT ON COLUMN mandalas.commitment IS 'User commitment/resolve (다짐) displayed on Mandala chart';
