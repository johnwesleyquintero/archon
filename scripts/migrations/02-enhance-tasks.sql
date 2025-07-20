-- Create task priority enum
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

-- Add new columns to tasks table
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS priority task_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text;

-- Create index on due_date for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);

-- Create index on category for better filtering
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks (category);

-- Add GIN index for tags array for better array operations and search
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING GIN (tags);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can update their own tasks." ON public.tasks;
CREATE POLICY "Users can update their own tasks." ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
