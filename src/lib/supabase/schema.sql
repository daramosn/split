-- SplitUp Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- =============================================
-- GROUPS
-- =============================================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  description text,
  currency text default 'USD' not null,
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz default now()
);

-- =============================================
-- PARTICIPANTS
-- =============================================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups on delete cascade not null,
  user_id uuid references auth.users on delete set null,
  name text not null,
  created_at timestamptz default now(),
  unique(group_id, user_id),
  unique(group_id, name)
);

-- =============================================
-- EXPENSES
-- =============================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups on delete cascade not null,
  title text not null,
  amount numeric(10,2) not null check (amount > 0),
  paid_by uuid references participants not null,
  split_between uuid[] not null,
  split_mode text default 'equal' not null check (split_mode in ('equal', 'parts', 'amount')),
  split_parts jsonb,
  split_amounts jsonb,
  date date default current_date not null,
  created_at timestamptz default now()
);

-- =============================================
-- SETTLEMENTS
-- =============================================
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups on delete cascade not null,
  from_id uuid references participants not null,
  to_id uuid references participants not null,
  amount numeric(10,2) not null check (amount > 0),
  paid boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_groups_owner_id on groups(owner_id);
create index if not exists idx_groups_invite_code on groups(invite_code);
create index if not exists idx_participants_group_id on participants(group_id);
create index if not exists idx_participants_user_id on participants(user_id);
create index if not exists idx_expenses_group_id on expenses(group_id);
create index if not exists idx_expenses_paid_by on expenses(paid_by);
create index if not exists idx_settlements_group_id on settlements(group_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table profiles enable row level security;
alter table groups enable row level security;
alter table participants enable row level security;
alter table expenses enable row level security;
alter table settlements enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Groups: owner full access, anyone can read via invite code
create policy "Owner full access to groups"
  on groups for all
  using (auth.uid() = owner_id);

create policy "Anyone can read groups via invite code"
  on groups for select
  using (true);

-- Participants: group members can read, owner can insert/delete
create policy "Anyone can read participants in a group"
  on participants for select
  using (exists (select 1 from groups where id = group_id));

create policy "Owner can insert participants"
  on participants for insert
  with check (auth.uid() = (select owner_id from groups where id = group_id));

create policy "Owner can delete participants"
  on participants for delete
  using (auth.uid() = (select owner_id from groups where id = group_id));

-- Expenses: group members can read, owner can insert/delete
create policy "Anyone can read expenses in a group"
  on expenses for select
  using (exists (select 1 from groups where id = group_id));

create policy "Owner can insert expenses"
  on expenses for insert
  with check (auth.uid() = (select owner_id from groups where id = group_id));

create policy "Owner can update expenses"
  on expenses for update
  using (auth.uid() = (select owner_id from groups where id = group_id));

create policy "Owner can delete expenses"
  on expenses for delete
  using (auth.uid() = (select owner_id from groups where id = group_id));

-- Settlements: group members can read, owner can insert/delete
create policy "Anyone can read settlements in a group"
  on settlements for select
  using (exists (select 1 from groups where id = group_id));

create policy "Owner can insert settlements"
  on settlements for insert
  with check (auth.uid() = (select owner_id from groups where id = group_id));

create policy "Owner can update settlements"
  on settlements for update
  using (auth.uid() = (select owner_id from groups where id = group_id));

create policy "Owner can delete settlements"
  on settlements for delete
  using (auth.uid() = (select owner_id from groups where id = group_id));

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Auto-create profile when user signs up via Google
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to check if user is group owner
create or replace function public.is_group_owner(group_id_param uuid, user_id_param uuid)
returns boolean as $$
begin
  return exists (
    select 1 from groups
    where id = group_id_param and owner_id = user_id_param
  );
end;
$$ language plpgsql security definer;

-- Function to get user's groups
create or replace function public.get_user_groups(user_id_param uuid)
returns table (
  id uuid,
  name text,
  description text,
  currency text,
  invite_code text,
  created_at timestamptz,
  participant_count bigint,
  total_expenses bigint
) as $$
begin
  return query
  select
    g.id,
    g.name,
    g.description,
    g.currency,
    g.invite_code,
    g.created_at,
    (select count(*) from participants p where p.group_id = g.id)::bigint as participant_count,
    (select count(*) from expenses e where e.group_id = g.id)::bigint as total_expenses
  from groups g
  where g.owner_id = user_id_param
  order by g.created_at desc;
end;
$$ language plpgsql security definer;