-- ============================================
-- SOLUÇÃO RÁPIDA: RLS bloqueando tudo
-- ============================================
-- Execute este arquivo se nada aparecer após migration 007
-- ============================================

-- OPÇÃO 1: Popular child_access (PREFERIDA)
-- ============================================

-- Inserir owners para todas as crianças existentes
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT 
  id as child_id,
  user_id,
  'owner' as role,
  user_id as granted_by
FROM children
WHERE user_id IS NOT NULL
ON CONFLICT (child_id, user_id) DO NOTHING;

-- Verificar
SELECT 
  COUNT(*) as total_children,
  (SELECT COUNT(*) FROM child_access) as total_acessos
FROM children;
-- Deve ter números iguais ou similares

-- ============================================
-- OPÇÃO 2: Desabilitar RLS temporariamente
-- ============================================
-- Use APENAS se Opção 1 não funcionar
-- CUIDADO: Remove segurança temporariamente!
-- ============================================

/*
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
ALTER TABLE records DISABLE ROW LEVEL SECURITY;
ALTER TABLE child_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE child_invites DISABLE ROW LEVEL SECURITY;

-- Após popular dados, REABILITE:

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_invites ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- OPÇÃO 3: Recriar policies mais permissivas
-- ============================================
-- Use se Opção 1 e 2 falharem
-- ============================================

/*
-- Temporariamente permitir ver todos os children do usuário logado
DROP POLICY IF EXISTS "Users can view children they have access to" ON children;

CREATE POLICY "Users can view their children (temp)"
  ON children FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = children.id
      AND child_access.user_id = auth.uid()
    )
  );

-- Temporariamente permitir ver todos os records do usuário logado
DROP POLICY IF EXISTS "Users can view records of accessible children" ON records;

CREATE POLICY "Users can view their records (temp)"
  ON records FOR SELECT
  USING (
    user_id = auth.uid()
    OR child_id IS NULL
    OR EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = records.child_id
      AND child_access.user_id = auth.uid()
    )
  );
*/

-- ============================================
-- TESTE FINAL
-- ============================================

-- Deve retornar suas crianças
SELECT * FROM children LIMIT 5;

-- Deve retornar seus registros
SELECT * FROM records LIMIT 5;

-- Deve retornar seus acessos
SELECT 
  ca.*,
  c.name as child_name
FROM child_access ca
JOIN children c ON c.id = ca.child_id
WHERE ca.user_id = auth.uid()
LIMIT 5;
