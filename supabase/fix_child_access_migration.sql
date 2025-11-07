-- ============================================
-- CORRIGIR: Migração de child_access
-- ============================================
-- Problema: Dados existentes não aparecem após migration 007
-- Causa: child_access não foi populado corretamente
-- ============================================

-- PASSO 1: Verificar estado atual
-- ============================================
SELECT 'children sem acesso' as problema, COUNT(*) as quantidade
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id
WHERE ca.id IS NULL;

-- PASSO 2: Popular child_access com dados existentes
-- ============================================
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT 
  c.id as child_id,
  c.user_id,
  'owner' as role,
  c.user_id as granted_by
FROM children c
WHERE c.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM child_access ca
  WHERE ca.child_id = c.id
  AND ca.user_id = c.user_id
);

-- PASSO 3: Verificar correção
-- ============================================
SELECT 'Verificação Final' as status, COUNT(*) as total_acessos
FROM child_access;

SELECT 
  c.id,
  c.name,
  c.user_id,
  ca.id as access_id,
  ca.role
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id AND ca.user_id = c.user_id
ORDER BY c.created_at DESC;

-- Se tudo estiver OK, deve ter 1 acesso (owner) para cada criança
