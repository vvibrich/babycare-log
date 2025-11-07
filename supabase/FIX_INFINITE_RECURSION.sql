-- ============================================
-- CORRIGIR: Recursão Infinita em child_access
-- ============================================
-- Erro: infinite recursion detected in policy
-- Causa: Policy verifica child_access dentro dela mesma
-- ============================================

-- PASSO 1: Deletar policy problemática
DROP POLICY IF EXISTS "Users can view access for their children" ON child_access;

-- PASSO 2: Criar policy correta (SEM recursão)
CREATE POLICY "Users can view child_access directly"
  ON child_access FOR SELECT
  USING (
    -- Usuário pode ver acessos de crianças onde ELE tem acesso
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
    OR
    -- OU ver seu próprio acesso
    user_id = auth.uid()
  );

-- VERIFICAR se funcionou
SELECT * FROM child_access LIMIT 5;
