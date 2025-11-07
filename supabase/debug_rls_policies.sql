-- ============================================
-- DEBUG: Por que RLS não está bloqueando?
-- ============================================

-- 1. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename IN ('records', 'children')
ORDER BY tablename;

-- Resultado esperado: rls_habilitado = true
-- Se false: RLS NÃO ESTÁ ATIVO! ❌


-- 2. VER TODAS AS POLICIES ATIVAS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('records', 'children')
ORDER BY tablename, cmd;

-- Deve mostrar 4 policies por tabela (SELECT, INSERT, UPDATE, DELETE)
-- Se vazio: POLICIES NÃO EXISTEM! ❌


-- 3. TESTAR POLICY MANUALMENTE
-- ============================================
-- Este teste simula o que acontece quando você faz login

-- Ver quem está logado agora
SELECT 
  auth.uid() as meu_user_id,
  auth.email() as meu_email;

-- Ver registros com e sem filtro RLS
SELECT 
  id,
  type,
  title,
  user_id,
  CASE 
    WHEN user_id = auth.uid() THEN '✅ MEU'
    WHEN user_id IS NULL THEN '⚠️ SEM DONO'
    ELSE '❌ DE OUTRO USUÁRIO'
  END as status
FROM records
ORDER BY created_at DESC
LIMIT 10;


-- 4. VERIFICAR SE HÁ REGISTROS SEM USER_ID
-- ============================================
SELECT 
  COUNT(*) FILTER (WHERE user_id IS NULL) as sem_user_id,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as com_user_id,
  COUNT(*) as total
FROM records;

-- Se sem_user_id > 0: Ainda há registros sem dono


-- 5. VER DISTRIBUIÇÃO COMPLETA
-- ============================================
SELECT 
  u.email,
  u.id as user_id,
  COUNT(r.id) as num_registros
FROM auth.users u
LEFT JOIN records r ON r.user_id = u.id
GROUP BY u.id, u.email
ORDER BY num_registros DESC;


-- ============================================
-- CORREÇÃO: Se RLS não está ativo
-- ============================================

-- HABILITAR RLS (se estava desabilitado)
/*
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
*/


-- ============================================
-- CORREÇÃO: Recriar Policies do Zero
-- ============================================
-- Execute se as policies não existem ou estão incorretas

/*
-- LIMPAR POLICIES ANTIGAS
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;

DROP POLICY IF EXISTS "Users can view their own children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;

-- CRIAR POLICIES CORRETAS PARA RECORDS
CREATE POLICY "Users can view their own records"
  ON records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON records FOR DELETE
  USING (auth.uid() = user_id);

-- CRIAR POLICIES CORRETAS PARA CHILDREN
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);
*/


-- ============================================
-- TESTE FINAL: Após correção
-- ============================================

/*
-- Como usuário vibrichdev@gmail.com
-- Deve retornar 6 registros
SELECT COUNT(*) FROM records;

-- Como usuário viniciusvibrich@ioasys.com.br  
-- Deve retornar 0 registros
SELECT COUNT(*) FROM records;
*/


-- ============================================
-- VERIFICAÇÃO DE SEGURANÇA
-- ============================================

-- Este query deve retornar apenas registros do usuário logado
-- Se retornar registros de outros, RLS NÃO está funcionando! ❌
SELECT 
  COUNT(*) as meus_registros,
  auth.email() as meu_email
FROM records
WHERE user_id = auth.uid();

-- Compare com o total (sem filtro WHERE)
-- Se forem diferentes, RLS está bloqueando outros usuários ✅
SELECT COUNT(*) as total_visivel FROM records;
