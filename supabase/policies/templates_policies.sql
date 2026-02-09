-- RLS Policies for Templates Table
-- Templates are publicly readable (no authentication required)

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Public read access for all templates
CREATE POLICY "Templates are publicly readable"
  ON templates
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete templates
-- (These policies will be implemented when admin role is added)
-- For now, use service role key for template management
