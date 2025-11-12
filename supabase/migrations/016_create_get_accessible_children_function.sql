-- Function: get_accessible_children()
-- Retorna todas as crianças às quais o usuário autenticado possui acesso através
-- do relacionamento child_access, incluindo a role associada.

create or replace function public.get_accessible_children()
returns table (
  id uuid,
  name text,
  birth_date date,
  photo_url text,
  notes text,
  created_at timestamptz,
  is_active boolean,
  user_id uuid,
  sex varchar(10),
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  blood_type varchar(10),
  allergies text,
  medical_conditions text,
  ongoing_medications text,
  doctor_name varchar(255),
  doctor_phone varchar(50),
  insurance_number varchar(100),
  last_weight_update timestamptz,
  last_height_update timestamptz,
  access_role text
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.birth_date,
    c.photo_url,
    c.notes,
    c.created_at,
    c.is_active,
    c.user_id,
    c.sex,
    c.weight_kg,
    c.height_cm,
    c.blood_type,
    c.allergies,
    c.medical_conditions,
    c.ongoing_medications,
    c.doctor_name,
    c.doctor_phone,
    c.insurance_number,
    c.last_weight_update,
    c.last_height_update,
    ca.role as access_role
  from public.child_access ca
  join public.children c on c.id = ca.child_id
  where ca.user_id = auth.uid()
  order by ca.granted_at desc;
$$;

grant execute on function public.get_accessible_children() to authenticated;
