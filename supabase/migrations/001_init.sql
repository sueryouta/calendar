-- tasksテーブル
-- アプリで必要な追加カラム (start_date, deadline, difficulty, is_checkpoint, parent_task_id, label) を含む
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  date text,
  time text,
  category text,
  notes text,
  completed boolean default false,
  created_at timestamptz default now(),
  start_date text,
  deadline text,
  difficulty text default 'small',
  is_checkpoint boolean default false,
  parent_task_id uuid,
  label text
);
alter table tasks enable row level security;
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);

-- categoriesテーブル
-- id は text 型（アプリが 'honsha' などの文字列IDを使用するため）
create table categories (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "Users can manage own categories" on categories for all using (auth.uid() = user_id);

-- templatesテーブル
create table templates (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text,
  difficulty text default 'small',
  color text,
  created_at timestamptz default now()
);
alter table templates enable row level security;
create policy "Users can manage own templates" on templates for all using (auth.uid() = user_id);
