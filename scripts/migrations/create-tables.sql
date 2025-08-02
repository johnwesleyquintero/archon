-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a function to set updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  is_completed boolean DEFAULT FALSE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks table
CREATE POLICY "Users can view their own tasks." ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks." ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks." ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks." ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to update updated_at on task changes
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_date date,
  status text DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'in_progress', 'completed', 'at_risk'
  progress integer DEFAULT 0 NOT NULL, -- 0-100
  attachments jsonb DEFAULT '[]'::jsonb, -- Store array of attachment objects { url, filename, type }
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT progress_check CHECK (progress >= 0 AND progress <= 100)
);

-- Set up Row Level Security (RLS) for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policies for goals table
CREATE POLICY "Users can view their own goals." ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals." ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals." ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals." ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to update updated_at on goal changes
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for journal entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  attachments jsonb DEFAULT '[]'::jsonb, -- Store array of attachment objects { url, filename, type }
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Policies for journal_entries table
CREATE POLICY "Users can view their own journal entries." ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries." ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries." ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries." ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to update updated_at on journal_entries changes
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for journal templates (publicly accessible)
CREATE TABLE IF NOT EXISTS public.journal_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  icon_name text, -- Name of Lucide icon, e.g., 'Sun', 'BookOpen'
  category text, -- e.g., 'daily', 'reflection', 'planning'
  title text NOT NULL, -- Default title for new entry
  content text, -- Default content for new entry
  color text -- Tailwind color class prefix, e.g., 'blue', 'green'
);

-- Insert some default journal templates
INSERT INTO public.journal_templates (name, description, icon_name, category, title, content, color)
VALUES
  ('Daily Check-in', 'A quick template to start your day with intention.', 'Sun', 'daily', 'Daily Check-in - {{DATE}}', '## Morning Gratitude\n- \n\n## Top 3 Priorities\n1. \n2. \n3. \n\n## Mood Check\n[ ] Great\n[ ] Good\n[ ] Okay\n[ ] Challenging', 'yellow'),
  ('Weekly Review', 'Reflect on your week and plan for the next.', 'CalendarDays', 'planning', 'Weekly Review - Week of {{DATE}}', '## Weekly Review\n**Biggest Wins This Week:**\n- \n\n**Challenges I Faced:**\n- \n\n**Lessons Learned:**\n- \n\n## Looking Ahead\n**Top 3 Priorities for Next Week:**\n1. \n2. \n3. ', 'blue'),
  ('Idea Brainstorm', 'Capture and expand on new ideas.', 'Lightbulb', 'creative', 'Idea Brainstorm: {{TOPIC}}', '## Idea: \n\n**Why is this a good idea?**\n\n**Potential Challenges:**\n\n**Next Steps:**\n- ', 'purple'),
  ('Gratitude Journal', 'Focus on what you are grateful for.', 'Heart', 'wellness', 'Gratitude Entry - {{DATE}}', 'Today, I am grateful for:\n\n1. \n2. \n3. ', 'pink'),
  ('Project Progress', 'Track the status and next steps for a project.', 'Briefcase', 'work', 'Project Progress: {{PROJECT_NAME}}', '## Project: \n\n**Current Status:**\n\n**Completed This Week:**\n- \n\n**Next Steps:**\n- \n\n**Blockers/Challenges:**\n- ', 'green');

-- Enable RLS for journal_templates
ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;

-- Policies for journal_templates table (read-only for all users)
CREATE POLICY "Journal templates are viewable by everyone." ON public.journal_templates
  FOR SELECT USING (true);

-- Create a trigger to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid duplicates on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
