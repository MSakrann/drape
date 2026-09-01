create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'trial',
  credits integer not null default 20,
  created_at timestamptz not null default now()
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workflow text not null,
  status text not null,
  credits_used integer not null default 0,
  input_path text,
  output_paths text[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own generations read" on public.generations for select using (auth.uid() = user_id);
create policy "own generations insert" on public.generations for insert with check (auth.uid() = user_id);
create policy "own generations update" on public.generations for update using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, plan, credits)
  values (new.id, new.email, 'trial', 20);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
