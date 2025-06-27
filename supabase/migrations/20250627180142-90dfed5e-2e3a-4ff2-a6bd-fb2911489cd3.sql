
-- Add part_id as UUID primary key to the parts table
ALTER TABLE parts ADD COLUMN part_id UUID DEFAULT gen_random_uuid();

-- Update existing rows to have UUIDs
UPDATE parts SET part_id = gen_random_uuid() WHERE part_id IS NULL;

-- Make part_id NOT NULL and set as primary key
ALTER TABLE parts ALTER COLUMN part_id SET NOT NULL;
ALTER TABLE parts ADD PRIMARY KEY (part_id);

-- Add indexes for performance
CREATE INDEX idx_parts_product_id ON parts(product_id);
CREATE INDEX idx_parts_user_id ON parts(user_id);

-- Add updated_at column if it doesn't exist
ALTER TABLE parts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_parts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parts_updated_at
  BEFORE UPDATE ON parts
  FOR EACH ROW
  EXECUTE FUNCTION update_parts_updated_at();
