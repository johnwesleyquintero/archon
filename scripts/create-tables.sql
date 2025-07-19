-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage/security/row-level-security#policies-for-public-access
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using (auth.uid() = owner)
  with check (bucket_id = 'avatars');


-- Create tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  due_date timestamp with time zone -- Added for sorting
);

alter table tasks enable row level security;

create policy "Tasks are viewable by their owners."
  on tasks for select
  using (auth.uid() = user_id);

create policy "Owners can create tasks."
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their tasks."
  on tasks for update
  using (auth.uid() = user_id);

create policy "Owners can delete their tasks."
  on tasks for delete
  using (auth.uid() = user_id);

-- Create goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  target_value numeric,
  unit text,
  progress numeric default 0,
  status text default 'pending', -- e.g., 'pending', 'in-progress', 'completed', 'on-hold'
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table goals enable row level security;

create policy "Goals are viewable by their owners."
  on goals for select
  using (auth.uid() = user_id);

create policy "Owners can create goals."
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their goals."
  on goals for update
  using (auth.uid() = user_id);

create policy "Owners can delete their goals."
  on goals for delete
  using (auth.uid() = user_id);

-- Create journal_entries table
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text,
  mood text, -- e.g., 'happy', 'sad', 'neutral', 'stressed'
  tags text[], -- Array of text tags
  template_name text, -- e.g., 'Daily Reflection', 'Gratitude Log'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table journal_entries enable row level security;

create policy "Journal entries are viewable by their owners."
  on journal_entries for select
  using (auth.uid() = user_id);

create policy "Owners can create journal entries."
  on journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their journal entries."
  on journal_entries for update
  using (auth.uid() = user_id);

create policy "Owners can delete their journal entries."
  on journal_entries for delete
  using (auth.uid() = user_id);
