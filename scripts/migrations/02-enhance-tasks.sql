-- Migration: Enhance tasks table with priority, due dates, and categories
-- This migration is idempotent and safe to run multiple times

-- Create task_priority enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create task_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to tasks table if they don't exist
DO $$ BEGIN
    -- Add priority column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ADD COLUMN priority task_priority DEFAULT 'medium';
    END IF;
    
    -- Add due_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
        ALTER TABLE tasks ADD COLUMN due_date timestamptz;
    END IF;
    
    -- Add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'category') THEN
        ALTER TABLE tasks ADD COLUMN category text;
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE tasks ADD COLUMN tags text[];
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ADD COLUMN status task_status DEFAULT 'pending';
    END IF;
    
    -- Add sort_order column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'sort_order') THEN
        ALTER TABLE tasks ADD COLUMN sort_order integer DEFAULT 0;
    END IF;
END $$;

-- Create index on due_date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create index on priority if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Create index on status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create index on category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- Update existing completed tasks to have completed status
UPDATE tasks SET status = 'completed' WHERE completed = true AND status = 'pending';
