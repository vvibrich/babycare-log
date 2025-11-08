# Aplicar Migration - User Email

Para exibir o email do usuário que cadastrou cada registro, é necessário aplicar a migration `008_add_user_email_to_records.sql`.

## Opção 1: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase/migrations/008_add_user_email_to_records.sql`
6. Clique em **Run** para executar

## Opção 2: Via psql (se tiver acesso direto ao banco)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/008_add_user_email_to_records.sql
```

## O que essa migration faz?

- Cria uma função `get_user_email()` que busca o email do usuário a partir do `user_id`
- Cria uma view `records_with_user` que inclui o campo `user_email` em cada registro
- A view é usada automaticamente pelo frontend para exibir quem cadastrou cada registro

## Após aplicar a migration

Reinicie o servidor Next.js para que as mudanças tenham efeito:

```bash
npm run dev
```

Você verá:
- **Na versão mobile**: Avatar clicável que mostra o email ao clicar
- **Na versão desktop**: Coluna "Cadastrado por" com avatar e email do usuário
