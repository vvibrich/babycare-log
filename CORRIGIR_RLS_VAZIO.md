# 🚨 Corrigir: Nada Aparece Após Migration 007

## Problema

Após executar migration `007_add_child_sharing.sql`:
- ❌ Não aparecem crianças
- ❌ Não aparecem registros
- ❌ Erro no console: `Error fetching children: {}`
- ❌ Tudo vazio

## Causa

As novas **RLS policies** dependem da tabela `child_access`, mas ela não foi populada corretamente com os dados existentes.

---

## ✅ Solução Rápida (3 minutos)

### Passo 1: Abrir Supabase SQL Editor

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor**

### Passo 2: Executar Script de Correção

**Cole e execute:**

```sql
-- Popular child_access com dados existentes
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
SELECT COUNT(*) as total_acessos FROM child_access;
```

**Resultado esperado:** `total_acessos` deve ser igual ao número de crianças cadastradas.

### Passo 3: Recarregar App

1. Volte para o app (http://localhost:3000)
2. **Faça logout** (menu do usuário → Sair)
3. **Limpe cache** (Ctrl+Shift+Del)
4. **Faça login** novamente

✅ **Deve funcionar agora!**

---

## 🔍 Diagnóstico Completo

Se a solução rápida não funcionou, execute o diagnóstico:

### 1. Verificar RLS

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('children', 'child_access', 'records');
```

**Esperado:** Todas com `rls_enabled = true`

### 2. Verificar child_access

```sql
SELECT 
  c.id,
  c.name,
  c.user_id,
  ca.id as access_id
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id AND ca.user_id = c.user_id;
```

**Esperado:** Todas as crianças devem ter `access_id` preenchido.

**Se `access_id` for NULL:** Execute novamente o INSERT do Passo 2.

### 3. Verificar Policies

```sql
SELECT tablename, COUNT(*) as num_policies
FROM pg_policies
WHERE tablename IN ('children', 'child_access', 'records')
GROUP BY tablename;
```

**Esperado:**
- `children`: 4 policies
- `child_access`: 4 policies
- `records`: 4 policies

---

## 🆘 Se Ainda Não Funcionar

### Solução Emergencial: Desabilitar RLS Temporariamente

⚠️ **CUIDADO:** Remove segurança! Use APENAS em desenvolvimento.

```sql
-- Desabilitar RLS
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
ALTER TABLE records DISABLE ROW LEVEL SECURITY;

-- Testar se funciona agora
SELECT * FROM children;
SELECT * FROM records LIMIT 10;
```

Se funcionar:

1. Popular child_access (Passo 2 acima)
2. Reabilitar RLS:

```sql
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 Scripts Disponíveis

Execute na ordem:

1. **`diagnose_rls_issue.sql`** - Diagnóstico completo
2. **`fix_child_access_migration.sql`** - Correção automática
3. **`SOLUCAO_RAPIDA_RLS.sql`** - Todas as opções

---

## 📊 Verificação Final

Após correção, execute:

```sql
-- Deve retornar suas crianças
SELECT id, name, user_id FROM children;

-- Deve retornar número igual de acessos
SELECT COUNT(*) FROM child_access;

-- Deve mostrar você como owner
SELECT 
  ca.role,
  c.name
FROM child_access ca
JOIN children c ON c.id = ca.child_id
WHERE ca.user_id = auth.uid();
```

Se tudo retornar dados, **está corrigido!** ✅

---

## 💡 Por Que Aconteceu?

A migration 007 deveria popular `child_access` automaticamente, mas pode falhar se:

1. Migration foi executada parcialmente
2. Erro de transação rollback
3. Ordem de execução incorreta
4. RLS habilitado antes do INSERT

**Solução:** Executar INSERT manualmente (sempre seguro).

---

## 🎯 Resumo TL;DR

```sql
-- Cole no SQL Editor e execute:
INSERT INTO child_access (child_id, user_id, role, granted_by)
SELECT id, user_id, 'owner', user_id
FROM children
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Logout/Login no app → Pronto!
```

---

**Criado em:** 07/11/2025  
**Versão do Cubbi:** 1.11.0
