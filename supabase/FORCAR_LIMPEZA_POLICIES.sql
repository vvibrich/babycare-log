-- ============================================
-- FORÇAR LIMPEZA COMPLETA DE POLICIES
-- ============================================
-- Remove TODAS as policies, independente do nome
-- ============================================

-- PASSO 1: Ver quais são as 10 policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies
WHERE tablename IN ('records', 'children')
ORDER BY tablename, cmd, policyname;

-- PASSO 2: DELETAR TODAS AS POLICIES (loop dinâmico)
-- ============================================
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('records', 'children')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Deletada: % na tabela %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- PASSO 3: VERIFICAR SE ZEROU
-- ============================================
SELECT 
  'Após Limpeza' as status,
  COUNT(*) as policies_restantes
FROM pg_policies 
WHERE tablename IN ('records', 'children');

-- DEVE RETORNAR 0! Se não, algo está muito errado.

-- PASSO 4: CRIAR AS 8 POLICIES CORRETAS
-- ============================================

-- RECORDS
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

-- CHILDREN
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

-- PASSO 5: VERIFICAR RESULTADO FINAL
-- ============================================
SELECT 
  'Resultado Final' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('records', 'children');

-- DEVE RETORNAR EXATAMENTE 8

-- Ver distribuição por tabela
SELECT 
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE tablename IN ('records', 'children')
GROUP BY tablename
ORDER BY tablename;

-- DEVE MOSTRAR:
-- children: 4
-- records: 4

-- Ver todas as policies criadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('records', 'children')
ORDER BY tablename, cmd;
