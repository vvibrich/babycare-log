-- ============================================
-- USER PROFILES TABLE
-- ============================================
-- Stores extended information about authenticated users
-- ============================================

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  age integer check (age >= 0),
  phone text,
  city text,
  bio text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Helpful index for quick lookups by phone (optional uniqueness handled at app level)
create index if not exists user_profiles_phone_idx on public.user_profiles (phone);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their profile" on public.user_profiles;
drop policy if exists "Users can insert their profile" on public.user_profiles;
drop policy if exists "Users can update their profile" on public.user_profiles;
drop policy if exists "Users can delete their profile" on public.user_profiles;

create policy "Users can view their profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);
