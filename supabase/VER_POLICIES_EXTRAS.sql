-- ============================================
-- IDENTIFICAR AS 2 POLICIES EXTRAS
-- ============================================

-- Ver TODAS as 10 policies detalhadamente
SELECT 
  ROW_NUMBER() OVER (ORDER BY tablename, cmd, policyname) as num,
  tablename,
  policyname,
  cmd as operacao,
  CASE 
    WHEN policyname LIKE '%view%' OR policyname LIKE '%select%' THEN '👁️ Ver'
    WHEN policyname LIKE '%insert%' OR policyname LIKE '%create%' THEN '➕ Criar'
    WHEN policyname LIKE '%update%' OR policyname LIKE '%edit%' THEN '✏️ Editar'
    WHEN policyname LIKE '%delete%' OR policyname LIKE '%remove%' THEN '🗑️ Deletar'
    ELSE '❓ Desconhecido'
  END as tipo,
  permissive,
  qual as condicao
FROM pg_policies
WHERE tablename IN ('records', 'children')
ORDER BY tablename, cmd, policyname;

-- Ver quantas policies por tabela e operação
SELECT 
  tablename,
  cmd,
  COUNT(*) as quantidade
FROM pg_policies
WHERE tablename IN ('records', 'children')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- Esperado: 1 policy por (tabela, cmd)
-- Se aparecer quantidade > 1: DUPLICADAS! ❌

-- Ver policies duplicadas (mesma tabela + comando)
SELECT 
  tablename,
  cmd,
  COUNT(*) as duplicadas,
  STRING_AGG(policyname, ', ') as nomes
FROM pg_policies
WHERE tablename IN ('records', 'children')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;

-- Se retornar algo: Essas são as extras!
