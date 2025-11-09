# 🔍 Solução: Não Consigo Vincular Sintomas a Incidentes

## ❌ Problema

Você tenta vincular um sintoma ou medicação a um incidente, mas:
- Não salva o vínculo
- Não aparece erro
- Ou aparece erro sobre "incident_id"

## 🎯 Causa

A coluna `incident_id` **NÃO EXISTE** na tabela `records` do seu banco de dados.

Isso significa que a **migration 009** ainda não foi aplicada.

## ✅ Solução (OBRIGATÓRIA)

### Passo 1: Aplicar a Migration 009

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Cole o conteúdo COMPLETO de: `supabase/migrations/009_add_incidents.sql`
4. Clique em **Run**

### Passo 2: Verificar se Funcionou

Execute no SQL Editor para verificar:

```sql
-- Verificar se a coluna incident_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'records' 
AND column_name = 'incident_id';
```

✅ Deve retornar uma linha mostrando `incident_id | uuid`

### Passo 3: Testar

1. Recarregue a página do app (F5)
2. Tente criar um sintoma
3. Selecione um incidente
4. Salve
5. ✅ Deve funcionar!

## 🔍 Como Saber se Preciso Aplicar a Migration

Abra o Console do Navegador (F12) e:

1. Tente criar/editar um sintoma vinculando a um incidente
2. Veja no console:
   - ✅ `Vinculando a incidente: [id]` - Boa! O código está tentando vincular
   - ❌ Se aparecer erro sobre `incident_id` - Precisa aplicar migration

## 📋 O que a Migration 009 Faz

```sql
-- Adiciona a coluna incident_id à tabela records
ALTER TABLE records
ADD COLUMN incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL;
```

Essa coluna é **OPCIONAL** e permite que registros sejam vinculados a incidentes.

## 🆘 Se Ainda Não Funcionar

### Debug 1: Verificar Console

Abra F12 > Console e procure por:
- ✅ `Vinculando a incidente:` - Código está funcionando
- ❌ Erro de SQL - Migration não foi aplicada corretamente

### Debug 2: Verificar Dados Salvos

No SQL Editor:

```sql
-- Ver se incident_id está sendo salvo
SELECT id, title, incident_id, created_at 
FROM records 
ORDER BY created_at DESC 
LIMIT 5;
```

- Se `incident_id` estiver NULL mesmo depois de vincular = problema
- Se `incident_id` tiver um UUID = funcionando! ✅

### Debug 3: Logs Detalhados

No console do navegador você verá:

**Ao criar/editar:**
```
✅ Vinculando a incidente: abc123-def456-...
📝 Dados completos a inserir: { incident_id: "abc123-...", ... }
```

**Se não houver incidente:**
```
ℹ️ Sem incidente selecionado
```

## ⚡ Solução Temporária (Se Não Puder Aplicar Migration Agora)

**Você PODE usar o sistema normalmente:**
- ✅ Criar sintomas e medicações SEM incidente
- ✅ Todas as outras funcionalidades funcionam
- ❌ Apenas não consegue vincular a incidentes

**Para usar incidentes:**
- OBRIGATÓRIO aplicar migration 009

## 📊 Ordem Correta das Migrations

Se você ainda não aplicou todas:

1. ✅ 010_fix_child_access_trigger.sql (corrige RLS)
2. ✅ 011_add_temperatura_to_constraint.sql (adiciona temperatura)
3. ✅ 009_add_incidents.sql (ativa incidentes)

## 💡 Dica Pro

Verifique todas as migrations aplicadas:

```sql
-- Ver todas as migrations aplicadas
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```

Você deve ver:
- `009_add_incidents`
- `010_fix_child_access_trigger`
- `011_add_temperatura_to_constraint`

Se alguma estiver faltando, aplique-a!
