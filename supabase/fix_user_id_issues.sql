-- ============================================
-- DIAGNÓSTICO E CORREÇÃO: User ID Issues
-- ============================================
-- Execute este arquivo para diagnosticar e corrigir
-- o problema de registros compartilhados
-- ============================================

-- PASSO 1: DIAGNÓSTICO
-- ============================================

-- Ver quantos registros existem sem user_id
SELECT 
  'records' as tabela,
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) - COUNT(user_id) as sem_user_id
FROM records
UNION ALL
SELECT 
  'children' as tabela,
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) - COUNT(user_id) as sem_user_id
FROM children;

-- Ver todos os usuários cadastrados
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at;

-- Ver distribuição de registros por usuário
SELECT 
  COALESCE(user_id::text, 'SEM USER_ID') as user_id,
  COUNT(*) as quantidade
FROM records
GROUP BY user_id
ORDER BY quantidade DESC;

-- PASSO 2: VERIFICAR SE RLS ESTÁ ATIVO
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename IN ('records', 'children');

-- Ver policies ativas
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('records', 'children');


-- ============================================
-- PASSO 3: CORREÇÃO
-- ============================================
-- Escolha a opção apropriada abaixo:
-- ============================================

-- OPÇÃO 1: Atribuir registros antigos ao usuário MAIS ANTIGO
-- (Use se quer que o primeiro usuário fique com os dados existentes)

/*
UPDATE records 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) 
WHERE user_id IS NULL;

UPDATE children 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) 
WHERE user_id IS NULL;
*/

-- OPÇÃO 2: Atribuir registros a um usuário ESPECÍFICO por email
-- (Substitua 'email@example.com' pelo email correto)

/*
UPDATE records 
SET user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com') 
WHERE user_id IS NULL;

UPDATE children 
SET user_id = (SELECT id FROM auth.users WHERE email = 'email@example.com') 
WHERE user_id IS NULL;
*/

-- OPÇÃO 3: Deletar registros sem dono (CUIDADO!)
-- (Use apenas se os registros sem user_id são dados de teste)

/*
DELETE FROM records WHERE user_id IS NULL;
DELETE FROM children WHERE user_id IS NULL;
*/

-- ============================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ============================================
-- Execute após aplicar a correção

-- Verificar se ainda há registros sem user_id
SELECT 
  'VERIFICAÇÃO' as status,
  (SELECT COUNT(*) FROM records WHERE user_id IS NULL) as records_sem_user,
  (SELECT COUNT(*) FROM children WHERE user_id IS NULL) as children_sem_user;

-- Se os números acima forem 0, está corrigido! ✅

-- Ver distribuição final
SELECT 
  u.email,
  COUNT(r.id) as num_records,
  COUNT(DISTINCT c.id) as num_children
FROM auth.users u
LEFT JOIN records r ON r.user_id = u.id
LEFT JOIN children c ON c.user_id = u.id
GROUP BY u.id, u.email
ORDER BY u.created_at;
