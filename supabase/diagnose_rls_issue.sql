-- ============================================
-- DIAGNÓSTICO COMPLETO: RLS Issues
-- ============================================

-- 1. Verificar se RLS está habilitado
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('children', 'child_access', 'child_invites', 'records')
ORDER BY tablename;

-- 2. Ver policies ativas
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('children', 'child_access', 'child_invites', 'records')
ORDER BY tablename, cmd;

-- 3. Verificar dados em child_access
-- ============================================
SELECT 
  'child_access' as tabela,
  COUNT(*) as total
FROM child_access;

-- 4. Verificar children sem acesso
-- ============================================
SELECT 
  c.id,
  c.name,
  c.user_id,
  CASE 
    WHEN ca.id IS NULL THEN '❌ SEM ACESSO'
    ELSE '✅ TEM ACESSO'
  END as status
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id AND ca.user_id = c.user_id
ORDER BY c.created_at DESC;

-- 5. Testar query como usuário específico (substitua o UUID)
-- ============================================
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = 'seu-user-id-aqui';

-- SELECT * FROM children; -- Deve retornar crianças com acesso

-- 6. Ver estrutura de child_access
-- ============================================
SELECT 
  ca.*,
  c.name as child_name
FROM child_access ca
JOIN children c ON c.id = ca.child_id
ORDER BY ca.created_at DESC;

-- ============================================
-- SOLUÇÃO: Se child_access estiver vazio
-- ============================================

-- Popular child_access com owners atuais
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT 
  id as child_id,
  user_id,
  'owner' as role,
  user_id as granted_by
FROM children
WHERE user_id IS NOT NULL
ON CONFLICT (child_id, user_id) DO NOTHING;

-- Verificar novamente
SELECT 
  'Após correção' as status,
  COUNT(*) as total_acessos
FROM child_access;
