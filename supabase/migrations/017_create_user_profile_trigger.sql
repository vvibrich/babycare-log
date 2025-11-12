-- Cria trigger para popular user_profiles a partir dos metadados do auth.users

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '')
  )
  on conflict (user_id) do update
    set
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_created_user_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
