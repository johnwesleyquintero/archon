-- This file was previously abbreviated. Here is its its full content.
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  username text UNIQUE,
  updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS) for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  due_date timestamp with time zone -- Added for sorting
);

-- Set up RLS for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks."
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks."
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks."
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks."
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE public.goals (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  progress integer DEFAULT 0 NOT NULL,
  status text DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'in-progress', 'completed', 'on-hold'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up RLS for goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals."
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create goals."
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals."
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals."
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content jsonb, -- Use jsonb for flexible content structure
  template_id uuid REFERENCES public.journal_templates (id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up RLS for journal_entries table
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries."
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create journal entries."
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries."
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries."
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create journal_templates table
CREATE TABLE public.journal_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL, -- e.g., 'Daily', 'Reflection', 'Goal Setting'
  content_schema jsonb NOT NULL, -- JSON schema for template content
  user_id uuid REFERENCES auth.users ON DELETE CASCADE, -- Optional: allow user-specific templates
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up RLS for journal_templates table
ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public journal templates are viewable by everyone."
  ON public.journal_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own journal templates."
  ON public.journal_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal templates."
  ON public.journal_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal templates."
  ON public.journal_templates FOR DELETE
  USING (auth.uid() = user_id);
