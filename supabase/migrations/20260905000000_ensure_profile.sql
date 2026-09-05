create or replace function public.ensure_profile()
returns table (credits integer, plan text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  insert into public.profiles (id, email, plan, credits)
  values (auth.uid(), null, 'trial', 20)
  on conflict (id) do nothing;

  return query
  select profiles.credits, profiles.plan
  from public.profiles
  where profiles.id = auth.uid();
end;
$$;

revoke all on function public.ensure_profile() from public, anon;
grant execute on function public.ensure_profile() to authenticated;
