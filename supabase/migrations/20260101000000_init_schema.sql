-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mandalas Table
CREATE TABLE IF NOT EXISTS mandalas (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Year
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),

  -- Day 1: Reflection
  reflection_theme TEXT,
  reflection_answers JSONB DEFAULT '{}'::JSONB,

  -- Day 2: Reflection Notes
  reflection_notes TEXT,

  -- Day 3: Center Goal
  center_goal TEXT CHECK (char_length(center_goal) <= 100),

  -- Day 4-5: Sub Goals (8개)
  sub_goals JSONB DEFAULT '[]'::JSONB,

  -- Day 6-13: Action Plans (64개)
  action_plans JSONB DEFAULT '{}'::JSONB,

  -- Day 14: AI Summary
  ai_summary JSONB,

  -- Progress Tracking
  current_day INTEGER DEFAULT 1
    CHECK (current_day >= 1 AND current_day <= 14),
  completed_days JSONB DEFAULT '[]'::JSONB,

  -- User Consent
  marketing_consent BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_year UNIQUE(user_id, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mandalas_user_id ON mandalas(user_id);
CREATE INDEX IF NOT EXISTS idx_mandalas_year ON mandalas(year);
CREATE INDEX IF NOT EXISTS idx_mandalas_current_day ON mandalas(current_day);
CREATE INDEX IF NOT EXISTS idx_mandalas_created_at ON mandalas(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mandalas_updated_at
  BEFORE UPDATE ON mandalas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mandalas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own mandalas
CREATE POLICY "Users can view own mandalas"
  ON mandalas FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own mandalas
CREATE POLICY "Users can insert own mandalas"
  ON mandalas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own mandalas
CREATE POLICY "Users can update own mandalas"
  ON mandalas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own mandalas
CREATE POLICY "Users can delete own mandalas"
  ON mandalas FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all mandalas
-- Note: Replace 'admin@example.com' with actual admin email
CREATE POLICY "Admins can view all mandalas"
  ON mandalas FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@example.com'
    )
  );
