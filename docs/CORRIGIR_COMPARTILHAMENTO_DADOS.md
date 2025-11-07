# 🔧 Corrigir: Todos Usuários Veem Mesmos Dados

## 🚨 Problema

Quando cadastro um novo usuário, ele vê todos os registros de todos os usuários.

## 🔍 Causa

Os registros existentes **não têm `user_id` definido** (são NULL). Quando user_id é NULL, as policies RLS não conseguem filtrar corretamente.

## ✅ Solução Rápida

### Passo 1: Diagnosticar

No **Supabase SQL Editor**, execute:

```sql
-- Ver quantos registros estão sem user_id
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) - COUNT(user_id) as SEM_USER_ID
FROM records;
```

**Se `SEM_USER_ID > 0`:** Precisa corrigir (continue)  
**Se `SEM_USER_ID = 0`:** Problema é outro (veja abaixo)

### Passo 2: Listar Usuários

```sql
-- Ver quais usuários existem
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at;
```

Anote o **email do usuário** que deve ficar com os dados antigos.

### Passo 3: Atribuir Registros ao Dono Correto

**Opção A: Primeiro usuário (mais comum)**

```sql
-- Atribuir todos os registros sem dono ao primeiro usuário
UPDATE records 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) 
WHERE user_id IS NULL;

UPDATE children 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) 
WHERE user_id IS NULL;
```

**Opção B: Usuário específico por email**

```sql
-- Substituir 'seu-email@exemplo.com' pelo email correto
UPDATE records 
SET user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com') 
WHERE user_id IS NULL;

UPDATE children 
SET user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com') 
WHERE user_id IS NULL;
```

### Passo 4: Verificar Correção

```sql
-- Deve retornar 0 em ambas as colunas
SELECT 
  (SELECT COUNT(*) FROM records WHERE user_id IS NULL) as records_sem_user,
  (SELECT COUNT(*) FROM children WHERE user_id IS NULL) as children_sem_user;
```

✅ Se retornar `0` e `0`: **Corrigido!**

### Passo 5: Testar

1. Faça logout de todos os usuários
2. Login com o usuário que recebeu os dados
3. Deve ver todos os registros antigos ✅
4. Login com outro usuário
5. Deve ver apenas registros que ele criar ✅

---

## 🔍 Se Ainda Não Funcionar

### Verificar se RLS está ativo

```sql
SELECT 
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE tablename IN ('records', 'children');
```

**Deve retornar `true` para ambas.**

Se retornar `false`:

```sql
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
```

### Verificar Policies

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('records', 'children')
ORDER BY tablename, cmd;
```

**Deve mostrar 4 policies para cada tabela:**
- SELECT, INSERT, UPDATE, DELETE

Se não aparecer:

```sql
-- Recriar policies
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

-- Repetir para children...
```

---

## 🧪 Teste Completo

### Cenário 1: Usuário Original

```
1. Login como primeiro usuário
2. Deve ver todos os registros antigos ✅
3. Criar novo registro
4. Deve aparecer na lista ✅
```

### Cenário 2: Usuário Novo

```
1. Criar novo usuário
2. Login com novo usuário
3. Lista deve estar vazia ✅
4. Criar novo registro
5. Deve aparecer apenas esse registro ✅
6. Não deve ver registros do usuário 1 ✅
```

### Cenário 3: Isolamento

```
1. Login usuário A
2. Ver X registros
3. Logout
4. Login usuário B
5. Ver Y registros (diferente de X)
6. Não ver nenhum registro do usuário A ✅
```

---

## 📊 Entendendo o Problema

### Como funciona RLS

```sql
-- RLS verifica:
auth.uid() = user_id

-- Se user_id é NULL:
'uuid-usuario-a' = NULL  →  FALSE ❌
'uuid-usuario-b' = NULL  →  FALSE ❌

-- Resultado: Ninguém vê os registros!
```

### Por que está vendo tudo?

**Possíveis causas:**

1. **RLS não está habilitado**
   - Solução: `ALTER TABLE records ENABLE ROW LEVEL SECURITY;`

2. **Policies não existem**
   - Solução: Criar policies (ver acima)

3. **user_id é NULL nos registros**
   - Solução: Atribuir user_id (Passo 3)

4. **Usuário está usando service_key no client**
   - Solução: Usar apenas ANON_KEY nas variáveis de ambiente

---

## 🛠️ Script Automático

Criado: `supabase/fix_user_id_issues.sql`

Execute para diagnóstico completo + opções de correção.

---

## 💡 Prevenção

Para evitar no futuro:

1. **Sempre inclua user_id ao inserir:**
   ```tsx
   const { user } = useAuth();
   insertData.user_id = user?.id;
   ```

2. **Valide antes de inserir:**
   ```tsx
   if (!user?.id) {
     alert('Você precisa estar logado');
     return;
   }
   ```

3. **Teste com múltiplos usuários** após qualquer mudança

---

## 🆘 Ainda Não Funciona?

### Checklist Final

- [ ] `user_id IS NOT NULL` em todos os registros?
- [ ] RLS está habilitado nas tabelas?
- [ ] Policies existem (4 por tabela)?
- [ ] Usando `NEXT_PUBLIC_SUPABASE_ANON_KEY` (não service_key)?
- [ ] Cache do navegador foi limpo?
- [ ] Fez logout/login após correção?

### Logs de Debug

No console do navegador:

```javascript
// Ver usuário atual
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id, user?.email);

// Ver registros retornados
const { data: records } = await supabase.from('records').select('*');
console.log('Records:', records);
```

---

**Atualizado:** 07/11/2025
