-- Create journal_templates table
CREATE TABLE journal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE journal_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users to view their own templates
CREATE POLICY "Authenticated users can view their own journal templates." ON journal_templates
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy for authenticated users to create their own templates
CREATE POLICY "Authenticated users can create their own journal templates." ON journal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for authenticated users to update their own templates
CREATE POLICY "Authenticated users can update their own journal templates." ON journal_templates
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy for authenticated users to delete their own templates
CREATE POLICY "Authenticated users can delete their own journal templates." ON journal_templates
  FOR DELETE USING (auth.uid() = user_id);
