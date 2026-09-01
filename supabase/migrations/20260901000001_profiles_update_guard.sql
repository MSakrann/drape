-- Clients may update profile metadata only; plan and credits are changed through
-- the guarded functions below so they cannot be forged with the anon key.
revoke update on table public.profiles from anon, authenticated;
grant update (email) on table public.profiles to authenticated;

drop policy if exists "own profile update" on public.profiles;
create policy "own profile metadata update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.decrement_credits(
  p_id uuid,
  p_amount integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if auth.uid() is distinct from p_id then
    raise exception 'Cannot change another user''s credits.';
  end if;

  if p_amount <= 0 then
    raise exception 'Credit amount must be positive.';
  end if;

  update public.profiles
  set credits = credits - p_amount
  where id = p_id
    and credits >= p_amount
  returning credits into remaining;

  return remaining;
end;
$$;

create or replace function public.choose_paid_plan(
  p_id uuid,
  p_plan text
)
returns table (plan text, credits integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_id then
    raise exception 'Cannot change another user''s plan.';
  end if;

  if p_plan not in ('starter', 'pro', 'business', 'agency') then
    raise exception 'Invalid plan.';
  end if;

  return query
  update public.profiles
  set
    plan = p_plan,
    credits = profiles.credits + case p_plan
      when 'starter' then 50
      when 'pro' then 150
      when 'business' then 400
      when 'agency' then 1200
    end
  where id = p_id
    and profiles.plan = 'trial'
  returning profiles.plan, profiles.credits;
end;
$$;

revoke all on function public.decrement_credits(uuid, integer) from public, anon;
grant execute on function public.decrement_credits(uuid, integer) to authenticated;
revoke all on function public.choose_paid_plan(uuid, text) from public, anon;
grant execute on function public.choose_paid_plan(uuid, text) to authenticated;
