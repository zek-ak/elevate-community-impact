-- Create pledges table for annual goal pledges
CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pledge_amount NUMERIC NOT NULL CHECK (pledge_amount >= 0),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own pledges
CREATE POLICY "Users can view own pledges" ON pledges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own pledges
CREATE POLICY "Users can create own pledges" ON pledges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own pledges
CREATE POLICY "Users can update own pledges" ON pledges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for group leaders to view group member pledges
CREATE POLICY "Group leaders can view group pledges" ON pledges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = pledges.user_id
      AND p.group_id IN (
        SELECT group_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy for finance admins to view all pledges
CREATE POLICY "Finance admins can view all pledges" ON pledges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('finance_admin', 'super_admin')
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_year ON pledges(year);

