# 🔧 CORREÇÃO: Vínculos com Incidentes Não Aparecem no Frontend

## ✅ Situação

- ✅ Dados salvam corretamente no banco (incident_id está preenchido)
- ❌ Frontend não mostra o vínculo (registros não aparecem nos incidentes)

## 🎯 Causa Raiz

A view `records_with_user` foi criada **ANTES** da coluna `incident_id` ser adicionada à tabela `records`.

**No PostgreSQL, views não atualizam automaticamente** quando você adiciona colunas à tabela base.

## ✅ Solução

### Aplicar Migration 012

Execute no **Supabase SQL Editor**:

```sql
-- Cole todo o conteúdo de: 012_refresh_records_view.sql
```

Essa migration:
1. Remove a view antiga
2. Recria a view incluindo **todas** as colunas de `records` (incluindo `incident_id`)
3. Configura as permissões corretamente

## 🧪 Como Verificar

### 1. Verificar se a view inclui incident_id

No SQL Editor:

```sql
-- Ver estrutura da view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'records_with_user'
ORDER BY ordinal_position;
```

✅ Deve aparecer `incident_id | uuid` na lista

### 2. Verificar dados na view

```sql
-- Ver registros com incident_id
SELECT id, title, incident_id, user_email 
FROM records_with_user 
WHERE incident_id IS NOT NULL
LIMIT 5;
```

✅ Deve mostrar os registros com `incident_id` preenchido

### 3. Testar no Frontend

1. Recarregue a página (F5)
2. Abra o Console do navegador (F12)
3. Procure por logs assim:

```
📊 Incidente "Nome do Incidente": {
  incident_id: "abc-123...",
  total_records: 10,
  records_with_incident_id: 3,  ← deve ser > 0
  matching_records: 3,           ← deve ser > 0
  sample_record: { incident_id: "...", ... }
}
```

4. Os registros vinculados agora devem aparecer no card do incidente!

## 🔍 Debug Adicional

Se ainda não funcionar:

### Verificar no banco diretamente

```sql
-- Ver registros vinculados a incidentes
SELECT 
  r.id,
  r.title,
  r.type,
  r.incident_id,
  i.title as incident_title
FROM records r
LEFT JOIN incidents i ON i.id = r.incident_id
WHERE r.incident_id IS NOT NULL
ORDER BY r.created_at DESC;
```

### Verificar no Console do Frontend

Com o console aberto, você verá:

**Quando NÃO tem incident_id (ANTES da migration 012):**
```javascript
sample_record: {
  id: "...",
  title: "...",
  // ❌ incident_id: undefined ou não existe
}
```

**Quando TEM incident_id (DEPOIS da migration 012):**
```javascript
sample_record: {
  id: "...",
  title: "...",
  incident_id: "abc-123...",  ✅ aparece aqui!
}
```

## 📋 Checklist de Solução

- [ ] Aplicar migration 012 no Supabase
- [ ] Verificar que view inclui `incident_id` (query acima)
- [ ] Recarregar página do app (F5)
- [ ] Verificar logs no console (deve mostrar `records_with_incident_id > 0`)
- [ ] Registros vinculados aparecem nos cards de incidentes ✅

## 🎯 Resultado Esperado

Depois de aplicar a migration 012:

1. ✅ Cards de incidentes mostram o contador correto (🩺 X sintomas, 💊 Y medicações)
2. ✅ Ao expandir, mostra todos os registros vinculados
3. ✅ Badges "🔗 Incidente" aparecem nos registros da lista principal
4. ✅ Exportar PDF do incidente inclui os registros corretos

## ⚡ Por que Aconteceu

**Timeline:**
1. Migration 008 criou a view `records_with_user` com `SELECT r.*`
2. Migration 009 adicionou coluna `incident_id` à tabela `records`
3. ❌ A view não foi atualizada automaticamente
4. Frontend continuou buscando da view antiga (sem `incident_id`)

**Solução:**
- Migration 012 recria a view com todas as colunas atualizadas

## 💡 Prevenção Futura

Sempre que adicionar uma coluna importante:
1. Adicione a coluna na migration
2. **Recrie as views** que usam essa tabela
3. Ou use `SELECT coluna1, coluna2...` explicitamente ao invés de `SELECT *`
