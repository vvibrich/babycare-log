-- ============================================
-- CORRIGIR TODAS AS RECURSÕES INFINITAS
-- ============================================
-- Problema: Policies circulares causam recursão infinita
-- Solução: Simplificar todas as policies
-- ============================================

-- ============================================
-- 1. DELETAR TODAS AS POLICIES PROBLEMÁTICAS
-- ============================================

-- children policies
DROP POLICY IF EXISTS "Users can view children they have access to" ON children;
DROP POLICY IF EXISTS "Users can create children" ON children;
DROP POLICY IF EXISTS "Owners and editors can update children" ON children;
DROP POLICY IF EXISTS "Only owners can delete children" ON children;

-- child_access policies  
DROP POLICY IF EXISTS "Users can view access for their children" ON child_access;
DROP POLICY IF EXISTS "Users can view child_access directly" ON child_access;
DROP POLICY IF EXISTS "Owners can grant access" ON child_access;
DROP POLICY IF EXISTS "Owners can revoke access" ON child_access;
DROP POLICY IF EXISTS "Owners can update roles" ON child_access;

-- records policies
DROP POLICY IF EXISTS "Users can view records of accessible children" ON records;
DROP POLICY IF EXISTS "Users can create records" ON records;
DROP POLICY IF EXISTS "Users can update their records or if owner/editor" ON records;
DROP POLICY IF EXISTS "Users can delete their records or if owner/editor" ON records;

-- ============================================
-- 2. CHILDREN - Policies SIMPLES (sem recursão)
-- ============================================

-- Ver crianças onde sou o user_id direto
CREATE POLICY "View own children"
  ON children FOR SELECT
  USING (user_id = auth.uid());

-- Criar criança (se torna owner automaticamente)
CREATE POLICY "Create children"
  ON children FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Atualizar próprias crianças
CREATE POLICY "Update own children"
  ON children FOR UPDATE
  USING (user_id = auth.uid());

-- Deletar próprias crianças
CREATE POLICY "Delete own children"
  ON children FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 3. CHILD_ACCESS - Policies SIMPLES
-- ============================================

-- Ver acessos das suas crianças ou seus próprios acessos
CREATE POLICY "View child access"
  ON child_access FOR SELECT
  USING (
    user_id = auth.uid()
    OR child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- Owner pode criar acessos (verificar direto em children)
CREATE POLICY "Grant access"
  ON child_access FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- Owner pode remover acessos (não o próprio)
CREATE POLICY "Revoke access"
  ON child_access FOR DELETE
  USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
    AND user_id != auth.uid()
  );

-- Owner pode atualizar roles
CREATE POLICY "Update roles"
  ON child_access FOR UPDATE
  USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- ============================================
-- 4. RECORDS - Policies SIMPLES
-- ============================================

-- Ver registros: próprios OU de crianças onde tem acesso
CREATE POLICY "View records"
  ON records FOR SELECT
  USING (
    user_id = auth.uid()
    OR child_id IN (
      SELECT child_id FROM child_access WHERE user_id = auth.uid()
    )
  );

-- Criar: próprios OU se tem acesso à criança
CREATE POLICY "Create records"
  ON records FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      child_id IS NULL
      OR child_id IN (
        SELECT child_id FROM child_access 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'editor')
      )
    )
  );

-- Atualizar: próprios OU se é owner/editor
CREATE POLICY "Update records"
  ON records FOR UPDATE
  USING (
    user_id = auth.uid()
    OR child_id IN (
      SELECT child_id FROM child_access 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
    )
  );

-- Deletar: próprios OU se é owner/editor
CREATE POLICY "Delete records"
  ON records FOR DELETE
  USING (
    user_id = auth.uid()
    OR child_id IN (
      SELECT child_id FROM child_access 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================
-- VERIFICAR
-- ============================================
SELECT 'Policies criadas com sucesso!' as status;

-- Testar
SELECT * FROM children LIMIT 3;
SELECT * FROM child_access LIMIT 3;
SELECT * FROM records LIMIT 3;
