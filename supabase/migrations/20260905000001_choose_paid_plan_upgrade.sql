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
    and profiles.plan is distinct from p_plan
  returning profiles.plan, profiles.credits;
end;
$$;
