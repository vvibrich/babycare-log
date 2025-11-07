-- ============================================
-- MIGRATION SEGURA PARA PRODUÇÃO
-- ============================================
-- Esta versão preserva dados existentes
-- Execute em PRODUÇÃO com dados existentes
-- ============================================

-- Step 1: Adicionar colunas user_id (nullable por enquanto)
ALTER TABLE records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Criar índices para performance
CREATE INDEX IF NOT EXISTS records_user_id_idx ON records(user_id);
CREATE INDEX IF NOT EXISTS children_user_id_idx ON children(user_id);

-- ============================================
-- IMPORTANTE: Execute o SQL abaixo ANTES de habilitar RLS
-- Escolha UMA das opções:
-- ============================================

-- OPÇÃO A: Associar dados existentes ao primeiro usuário cadastrado
-- (Use se há apenas 1 usuário ou família)
-- UPDATE records SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
-- UPDATE children SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;

-- OPÇÃO B: Associar dados existentes a um usuário específico
-- (Substitua 'seu-email@example.com' pelo email do usuário)
-- UPDATE records SET user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@example.com') WHERE user_id IS NULL;
-- UPDATE children SET user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@example.com') WHERE user_id IS NULL;

-- OPÇÃO C: Deletar dados antigos (CUIDADO: Irreversível!)
-- DELETE FROM records WHERE user_id IS NULL;
-- DELETE FROM children WHERE user_id IS NULL;

-- ============================================
-- Step 3: DEPOIS de migrar os dados, habilite RLS
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;

DROP POLICY IF EXISTS "Users can view their own children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;

-- RLS Policies para records
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

-- RLS Policies para children
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

-- ============================================
-- VERIFICAÇÃO: Execute para confirmar que funcionou
-- ============================================
-- SELECT COUNT(*) as total_records, COUNT(user_id) as with_user_id FROM records;
-- SELECT COUNT(*) as total_children, COUNT(user_id) as with_user_id FROM children;
-- 
-- Se total_records = with_user_id, está OK! ✅
-- Se with_user_id < total_records, ainda há dados sem user_id ⚠️
