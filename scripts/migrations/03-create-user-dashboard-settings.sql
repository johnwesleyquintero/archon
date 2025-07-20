CREATE TABLE user_dashboard_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_dashboard_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboard settings."
  ON user_dashboard_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard settings."
  ON user_dashboard_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings."
  ON user_dashboard_settings FOR UPDATE
  USING (auth.uid() = user_id);