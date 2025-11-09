# Aplicar Migration - Sistema de Incidentes

Para ativar o sistema de incidentes, é necessário aplicar a migration `009_add_incidents.sql`.

## O que essa migration faz?

- Cria a tabela `incidents` para armazenar incidentes
- Adiciona a coluna `incident_id` na tabela `records` (opcional, pode ser null)
- Configura políticas RLS (Row Level Security) para incidentes
- Cria índices para melhor performance
- Configura triggers para atualizar timestamps

## Como aplicar

### Opção 1: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase/migrations/009_add_incidents.sql`
6. Clique em **Run** para executar

### Opção 2: Via psql (se tiver acesso direto ao banco)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/009_add_incidents.sql
```

## Estrutura da Tabela `incidents`

```sql
incidents
  - id (UUID, primary key)
  - child_id (UUID, references children)
  - user_id (UUID)
  - title (TEXT) - Ex: "Queda na escola"
  - description (TEXT, optional)
  - status (TEXT) - 'active', 'resolved', 'monitoring'
  - severity (TEXT) - 'low', 'medium', 'high'
  - started_at (TIMESTAMP)
  - resolved_at (TIMESTAMP, nullable)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## Compatibilidade

✅ **Totalmente compatível com registros existentes**
- Registros antigos terão `incident_id = NULL`
- Continuam funcionando normalmente
- Podem ser vinculados a incidentes posteriormente se necessário

## Após aplicar a migration

Reinicie o servidor Next.js:

```bash
npm run dev
```

## Funcionalidades Disponíveis

Após aplicar a migration, você terá acesso a:

1. **Criar incidentes** - Agrupe sintomas e medicações relacionados
2. **Vincular registros** - Associe sintomas/medicações a incidentes ao criar
3. **Visualizar incidentes** - Card expansível na HomePage
4. **Gerenciar status** - Ativo, Monitorando, Resolvido
5. **Exportar PDF** - Gere relatórios específicos por incidente
6. **Severidade** - Classifique como Baixa, Média ou Alta

## Exemplos de Uso

### Caso 1: Queda
- Incidente: "Queda no playground"
- Registros: Hematoma, Dor, Gelo aplicado

### Caso 2: Infecção Respiratória
- Incidente: "Infecção respiratória"
- Registros: Febre (38.5°C), Tosse, Antibiótico administrado

### Caso 3: Alergia Alimentar
- Incidente: "Reação alérgica - morango"
- Registros: Coceira, Inchaço, Anti-histamínico
