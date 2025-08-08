-- Add goal_id to tasks table
ALTER TABLE public.tasks
ADD COLUMN goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL;

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON public.tasks(goal_id);
