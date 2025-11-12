-- Permite que o serviço interno do Supabase (service_role) gerencie perfis
-- usado por triggers que criam registros em user_profiles ao cadastrar usuários

drop policy if exists "Service role can insert user profiles" on public.user_profiles;
drop policy if exists "Service role can update user profiles" on public.user_profiles;

create policy "Service role can insert user profiles"
  on public.user_profiles for insert
  with check (auth.role() = 'service_role');

create policy "Service role can update user profiles"
  on public.user_profiles for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
