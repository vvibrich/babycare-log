# 🔧 CORREÇÃO URGENTE: Erro de RLS ao Adicionar Registros

## ❌ Problema

Erro: **"new row violates row-level security policy for table records"**

## 🎯 Causa Raiz

Quando uma criança é criada, não está sendo adicionado automaticamente um registro na tabela `child_access` com role `owner`. Isso faz com que o usuário não tenha permissão para criar registros para sua própria criança.

## ✅ Solução

Aplique a migration `010_fix_child_access_trigger.sql` que:
1. Cria um trigger para adicionar automaticamente o owner ao `child_access`
2. Corrige crianças existentes que não têm registro no `child_access`

## 📝 Como Aplicar

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo COMPLETO do arquivo: `supabase/migrations/010_fix_child_access_trigger.sql`
6. Clique em **Run** para executar
7. ✅ Problema resolvido!

### Opção 2: Via psql

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/010_fix_child_access_trigger.sql
```

## 🔍 O que a Migration Faz

### 1. Cria Função de Trigger
```sql
CREATE FUNCTION add_owner_to_child_access()
```
Esta função adiciona automaticamente o criador da criança como `owner` na tabela `child_access`.

### 2. Cria Trigger
```sql
CREATE TRIGGER add_owner_access_trigger
  AFTER INSERT ON children
```
Executa a função automaticamente sempre que uma nova criança é criada.

### 3. Corrige Dados Existentes
```sql
INSERT INTO child_access ...
```
Adiciona registros de `owner` para todas as crianças existentes que não têm acesso configurado.

## ✨ Após Aplicar

Você poderá:
- ✅ Criar sintomas sem erros de RLS
- ✅ Criar medicações sem erros de RLS
- ✅ Editar registros normalmente
- ✅ Criar novas crianças sem problemas futuros

## 🧪 Como Testar

1. Aplique a migration
2. Tente adicionar um sintoma ou medicação
3. Deve funcionar perfeitamente!

## 📊 Verificação (Opcional)

Para verificar se suas crianças têm acesso configurado:

```sql
SELECT 
  c.name as child_name,
  c.user_id as owner_id,
  ca.role,
  ca.status
FROM children c
LEFT JOIN child_access ca ON ca.child_id = c.id AND ca.user_id = c.user_id
WHERE c.user_id = auth.uid();
```

Você deve ver role = 'owner' e status = 'accepted' para todas as suas crianças.

## 🚨 Importante

Esta migration é **essencial** para o funcionamento correto do sistema. Sem ela, você não conseguirá criar registros para suas crianças.
