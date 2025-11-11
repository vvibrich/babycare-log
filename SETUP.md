# 🚀 Setup Rápido - Cubbi

## 1. Configurar Supabase

### Criar Projeto

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Escolha um nome (ex: `cubbi`)
4. Defina uma senha do banco de dados
5. Selecione a região (preferencialmente próxima ao Brasil)
6. Aguarde a criação do projeto (~2 minutos)

### Obter Credenciais

1. No painel do projeto, vá em **Settings** → **API**
2. Copie os valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Executar Migration

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `supabase/migrations/001_create_records_table.sql`
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
5. Verifique se apareceu "Success. No rows returned"

## 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 3. Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 4. Verificar Instalação

1. Acesse a aplicação
2. Tente adicionar um sintoma ou medicação
3. Verifique se o registro aparece na lista
4. No Supabase, vá em **Table Editor** → **records** para ver os dados

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas
- [ ] Migration executada (tabela `records` criada)
- [ ] Arquivo `.env.local` criado com as variáveis
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Teste de inserção funcionando

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Teste a URL do Supabase no navegador

### Erro: "relation 'records' does not exist"

- Execute a migration SQL novamente no SQL Editor
- Verifique se não há erros na execução

### Erro: "Row Level Security policy violation"

- Verifique se a policy foi criada corretamente na migration
- A policy deve permitir todas as operações (FOR ALL)

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
