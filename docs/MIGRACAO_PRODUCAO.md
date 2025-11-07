# 🚀 Guia de Migração para Produção

## ⚠️ LEIA ANTES DE APLICAR EM PRODUÇÃO

Este guia explica como aplicar a migration de autenticação **SEM PERDER DADOS**.

---

## 📊 Verificar Estado Atual

### 1. Verificar se há dados em produção

No Supabase SQL Editor:

```sql
-- Verificar quantos registros existem
SELECT COUNT(*) FROM records;
SELECT COUNT(*) FROM children;
```

**Se retornar 0:** Pode usar migration original (`006_add_authentication_rls.sql`)  
**Se retornar > 0:** Use migration segura (`006_add_authentication_rls_SAFE.sql`)

---

## 🛡️ Migração Segura (Com Dados Existentes)

### Passo 1: Criar Usuário Admin

**Se ainda não tem usuário cadastrado:**

1. Acesse: `https://seu-app.com/signup`
2. Cadastre-se com email principal
3. Confirme o email
4. Anote o email usado

### Passo 2: Executar Parte 1 da Migration

No Supabase Dashboard → SQL Editor:

```sql
-- Adicionar colunas (sem habilitar RLS ainda)
ALTER TABLE records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índices
CREATE INDEX IF NOT EXISTS records_user_id_idx ON records(user_id);
CREATE INDEX IF NOT EXISTS children_user_id_idx ON children(user_id);
```

### Passo 3: Associar Dados Existentes ao Usuário

**Escolha UMA das opções:**

#### Opção A: Primeiro Usuário (Recomendado se há só 1 usuário)

```sql
-- Associar ao primeiro usuário cadastrado
UPDATE records SET user_id = (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
) WHERE user_id IS NULL;

UPDATE children SET user_id = (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
) WHERE user_id IS NULL;
```

#### Opção B: Usuário Específico por Email

```sql
-- Substituir 'seu-email@example.com' pelo email correto
UPDATE records SET user_id = (
  SELECT id FROM auth.users WHERE email = 'seu-email@example.com'
) WHERE user_id IS NULL;

UPDATE children SET user_id = (
  SELECT id FROM auth.users WHERE email = 'seu-email@example.com'
) WHERE user_id IS NULL;
```

### Passo 4: Verificar Migração de Dados

```sql
-- Verificar se todos os registros têm user_id agora
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) - COUNT(user_id) as sem_user_id
FROM records;

SELECT 
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) - COUNT(user_id) as sem_user_id
FROM children;
```

**Resultado esperado:** `sem_user_id` deve ser **0**

✅ Se `sem_user_id = 0`, continue  
❌ Se `sem_user_id > 0`, repita Passo 3

### Passo 5: Habilitar RLS

**Agora é SEGURO habilitar RLS:**

```sql
-- Habilitar Row Level Security
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Criar policies
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

-- Policies para children
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
```

### Passo 6: Testar

1. Faça login no app com o usuário usado no Passo 3
2. Verifique se os dados aparecem ✅
3. Tente criar novo registro ✅
4. Faça logout e login com outro usuário
5. Verifique que não vê os dados do primeiro usuário ✅

---

## 🆕 Migração Nova (Sem Dados)

**Se o banco está vazio:**

Simplesmente execute:

```sql
-- Executar arquivo completo
-- supabase/migrations/006_add_authentication_rls.sql
```

Tudo será criado de uma vez.

---

## 🔄 Rollback (Desfazer Migration)

**Se algo der errado:**

```sql
-- Desabilitar RLS
ALTER TABLE records DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;

-- Remover policies
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;

DROP POLICY IF EXISTS "Users can view their own children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;

-- Remover colunas (CUIDADO: perde vinculação de usuário)
-- ALTER TABLE records DROP COLUMN user_id;
-- ALTER TABLE children DROP COLUMN user_id;
```

---

## ✅ Checklist de Produção

Antes de aplicar:

- [ ] Backup do banco de dados
- [ ] Testar migration em ambiente de staging
- [ ] Verificar se há dados existentes
- [ ] Criar pelo menos 1 usuário admin
- [ ] Ler este guia completo

Durante aplicação:

- [ ] Executar Passo 2 (adicionar colunas)
- [ ] Executar Passo 3 (migrar dados)
- [ ] Executar Passo 4 (verificar)
- [ ] Executar Passo 5 (habilitar RLS)
- [ ] Executar Passo 6 (testar)

Após aplicação:

- [ ] Verificar que dados aparecem
- [ ] Testar criação de novos registros
- [ ] Testar com múltiplos usuários
- [ ] Monitorar erros

---

## 🆘 Problemas Comuns

### Dados não aparecem após RLS

**Causa:** user_id ainda é NULL em alguns registros

**Solução:**
```sql
-- Encontrar registros sem user_id
SELECT * FROM records WHERE user_id IS NULL LIMIT 10;
SELECT * FROM children WHERE user_id IS NULL LIMIT 10;

-- Atualizar manualmente
UPDATE records SET user_id = 'uuid-do-usuario' WHERE user_id IS NULL;
UPDATE children SET user_id = 'uuid-do-usuario' WHERE user_id IS NULL;
```

### Erro "permission denied for table"

**Causa:** RLS está bloqueando acesso

**Solução:**
```sql
-- Verificar se usuário está autenticado
SELECT auth.uid(); -- Deve retornar um UUID

-- Verificar se há dados com esse user_id
SELECT * FROM records WHERE user_id = auth.uid();
```

### Múltiplos usuários veem mesmos dados

**Causa:** Todos os dados têm o mesmo user_id

**Solução:** Isso é **esperado** se você migrou dados existentes para 1 usuário. Novos usuários terão seus próprios dados.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs no Supabase Dashboard
2. Teste queries SQL manualmente
3. Revise este guia passo a passo
4. Considere fazer rollback temporariamente

---

## 💡 Recomendações

### Para Produção:

1. **Sempre faça backup** antes de migrations
2. **Teste em staging** primeiro
3. **Aplique em horário de baixo tráfego**
4. **Monitore** após aplicação
5. **Tenha plano de rollback** pronto

### Para Desenvolvimento:

1. Pode usar migration original sem problemas
2. Dados de teste não precisam migração
3. Pode recriar banco se necessário

---

**Criado em:** 07/11/2025  
**Versão:** 1.9.0
