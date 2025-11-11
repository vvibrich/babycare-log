-- ============================================
-- VIEW: child_access_with_details
-- ============================================
-- Exibe os acessos com informações amigáveis de usuário
-- ============================================

create or replace view public.child_access_with_details as
select
  ca.id,
  ca.child_id,
  ca.user_id,
  ca.role,
  ca.granted_by,
  ca.granted_at,
  ca.created_at,
  auth_users.email as user_email,
  profiles.full_name as user_full_name
from public.child_access ca
left join auth.users auth_users on auth_users.id = ca.user_id
left join public.user_profiles profiles on profiles.user_id = ca.user_id;

-- Garantir privilégios mínimos
grant select on public.child_access_with_details to authenticated;

-- ============================================
-- VIEW: child_invites_with_details
-- ============================================
-- Inclui nome completo se o convidado já tiver perfil
-- ============================================

create or replace view public.child_invites_with_details as
select
  ci.*,
  auth_users.email as invitee_email_confirmed,
  profiles.full_name as invitee_full_name
from public.child_invites ci
left join auth.users auth_users on auth_users.id = ci.invitee_id
left join public.user_profiles profiles on profiles.user_id = ci.invitee_id;

grant select on public.child_invites_with_details to authenticated;
