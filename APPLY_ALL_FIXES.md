# 🚀 APLICAR TODAS AS CORREÇÕES - Ordem Correta

Para resolver todos os erros, aplique as migrations na ordem abaixo:

## 📋 Migrations Necessárias (EM ORDEM)

### 1️⃣ Migration 010: Corrigir RLS para child_access
**Arquivo:** `supabase/migrations/010_fix_child_access_trigger.sql`  
**Resolve:** Erro "row-level security policy"  
**O que faz:** Adiciona automaticamente o owner ao criar uma criança

### 2️⃣ Migration 011: Adicionar 'temperatura' à constraint
**Arquivo:** `supabase/migrations/011_add_temperatura_to_constraint.sql`  
**Resolve:** Erro "check constraint check_symptom_type"  
**O que faz:** Permite usar o novo tipo 'temperatura' nos sintomas

### 3️⃣ Migration 009: Sistema de Incidentes (OPCIONAL)
**Arquivo:** `supabase/migrations/009_add_incidents.sql`  
**Resolve:** Ativa o sistema de incidentes  
**O que faz:** Cria tabela incidents e permite agrupar registros

---

## 🎯 Como Aplicar (Supabase Dashboard)

### Passo 1: Corrigir RLS
```sql
-- Cole e execute o conteúdo de: 010_fix_child_access_trigger.sql
```
✅ Após isso, você poderá criar registros!

### Passo 2: Adicionar 'temperatura'
```sql
-- Cole e execute o conteúdo de: 011_add_temperatura_to_constraint.sql
```
✅ Após isso, você poderá usar o tipo 'temperatura'!

### Passo 3: Ativar Incidentes (Opcional)
```sql
-- Cole e execute o conteúdo de: 009_add_incidents.sql
```
✅ Após isso, você poderá criar e usar incidentes!

---

## 🔍 Verificação Rápida

Execute no SQL Editor para verificar se tudo está OK:

```sql
-- 1. Verificar se você tem acesso às suas crianças
SELECT 
  c.name, 
  ca.role 
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id AND ca.user_id = auth.uid()
WHERE c.user_id = auth.uid();
-- Deve mostrar role = 'owner' para todas as suas crianças

-- 2. Verificar se 'temperatura' está permitida
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'check_symptom_type';
-- Deve incluir 'temperatura' na lista

-- 3. Verificar se tabela incidents existe (se aplicou migration 009)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'incidents'
);
-- Deve retornar 'true' se a migration foi aplicada
```

---

## ⚡ Ordem de Prioridade

**URGENTE (Precisa para funcionar básico):**
- ✅ Migration 010 (RLS)
- ✅ Migration 011 (temperatura)

**OPCIONAL (Funcionalidades extras):**
- ⭐ Migration 009 (Incidentes)

---

## 🧪 Teste Após Aplicar

1. ✅ Tente adicionar um sintoma com temperatura
2. ✅ Tente adicionar uma medicação
3. ✅ Verifique se não há mais erros

---

## 📞 Se Ainda Houver Erro

Verifique no console do navegador (F12) qual erro específico está aparecendo e me informe!

---

## 💡 Dica Pro

Para aplicar todas de uma vez, você pode concatenar os SQLs:

```sql
-- ATENÇÃO: Execute apenas se quiser aplicar tudo de uma vez

-- Migration 010
-- [cole todo o conteúdo de 010_fix_child_access_trigger.sql]

-- Migration 011
-- [cole todo o conteúdo de 011_add_temperatura_to_constraint.sql]

-- Migration 009 (opcional)
-- [cole todo o conteúdo de 009_add_incidents.sql]
```

Mas é mais seguro aplicar uma por vez e verificar!
