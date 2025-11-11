# 🔐 Sistema de Autenticação

## Visão Geral

O Cubbi utiliza autenticação via Supabase Auth com email e senha. Cada usuário tem acesso apenas aos seus próprios dados através de Row Level Security (RLS).

## Funcionalidades

### 🔑 Login e Cadastro

**Login (`/login`)**
- Email e senha
- Validação de credenciais
- Redirecionamento automático para home
- Mensagens de erro amigáveis

**Cadastro (`/signup`)**
- Email e senha
- Confirmação de senha
- Mínimo de 6 caracteres na senha
- Envio de email de confirmação
- Validações client-side

### 🛡️ Proteção de Rotas

Todas as rotas principais são protegidas:
- `/` (Home)
- `/add/symptom`
- `/add/medication`
- `/children/*`
- `/charts`
- `/report`

Usuários não autenticados são redirecionados para `/login`.

### 👤 Menu de Usuário

- Exibe email do usuário logado
- Botão de logout
- Dropdown menu no header

## Arquitetura

### AuthContext

**Localização:** `contexts/AuthContext.tsx`

```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Funcionalidades:**
- Gerencia estado global de autenticação
- Monitora mudanças de sessão
- Fornece métodos de login, cadastro e logout

### ProtectedRoute

**Localização:** `components/ProtectedRoute.tsx`

```tsx
<ProtectedRoute>
  <HomePage />
</ProtectedRoute>
```

**Comportamento:**
- Verifica se usuário está autenticado
- Mostra loading durante verificação
- Redireciona para `/login` se não autenticado
- Renderiza children se autenticado

### UserMenu

**Localização:** `components/UserMenu.tsx`

**Features:**
- Ícone de usuário
- Dropdown com email
- Botão de logout
- Integrado ao header

## Row Level Security (RLS)

### Tabela: `records`

```sql
-- Políticas RLS
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
```

### Tabela: `children`

```sql
-- Políticas RLS (mesma estrutura)
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

-- ... (INSERT, UPDATE, DELETE)
```

### Como Funciona

1. **Cadastro/Login:** Usuário cria conta ou faz login
2. **Token JWT:** Supabase gera token de autenticação
3. **Requisições:** Token é enviado automaticamente
4. **RLS:** Banco filtra dados onde `user_id = auth.uid()`
5. **Isolamento:** Cada usuário só vê seus dados

## Fluxo de Autenticação

### Primeiro Acesso

```
1. Usuário acessa app (/)
        ↓
2. ProtectedRoute verifica autenticação
        ↓
3. Não autenticado → Redireciona para /login
        ↓
4. Usuário clica "Cadastre-se"
        ↓
5. Preenche email e senha em /signup
        ↓
6. Supabase envia email de confirmação
        ↓
7. Usuário confirma email no link
        ↓
8. Faz login em /login
        ↓
9. Redirecionado para / ✅
```

### Login Subsequente

```
1. Usuário acessa app (/)
        ↓
2. ProtectedRoute verifica sessão
        ↓
3. Sessão válida → Renderiza HomePage ✅
```

### Logout

```
1. Usuário clica em UserMenu → Sair
        ↓
2. AuthContext.signOut() é chamado
        ↓
3. Supabase invalida sessão
        ↓
4. Redirecionado para /login
```

## Configuração no Supabase

### 1. Habilitar Email Auth

No Supabase Dashboard:
1. **Authentication** → **Providers**
2. **Email** → Enable
3. **Confirm email:** ON (recomendado)

### 2. Executar Migration

```bash
# Executar migration 006_add_authentication_rls.sql
```

Isso adiciona:
- Campo `user_id` nas tabelas
- RLS policies
- Índices para performance

### 3. Templates de Email (Opcional)

Customize os emails em:
- **Authentication** → **Email Templates**
- Confirm signup
- Magic Link
- Reset Password

### 4. URL Redirects

Configure em **Authentication** → **URL Configuration**:
- Site URL: `http://localhost:3000` (dev)
- Redirect URLs: `http://localhost:3000/**` (dev)

## Implementação nos Componentes

### RecordForm

```tsx
const { user } = useAuth();

const insertData = {
  // ... outros campos
  user_id: user?.id,  // ← Vincula ao usuário
};

await supabase.from('records').insert([insertData]);
```

### HomePage

```tsx
export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
```

### Layout

```tsx
<ThemeProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
</ThemeProvider>
```

## Segurança

### ✅ Implementado

- Autenticação via Supabase Auth
- RLS em todas as tabelas
- Proteção de rotas client-side
- user_id vinculado a auth.users
- Logout adequado
- Validação de senha (mín 6 caracteres)

### ⚠️ Considerações

- **Confirmação de email:** Ativada (recomendado)
- **Rate limiting:** Gerenciado pelo Supabase
- **Senhas:** Hasheadas pelo Supabase
- **Tokens:** JWT gerenciado automaticamente

### 🔒 Boas Práticas

1. **Nunca expor SUPABASE_SERVICE_KEY** (apenas ANON_KEY)
2. **Sempre usar RLS** em tabelas com dados de usuário
3. **Validar dados** tanto client quanto server-side
4. **Logout adequado** ao sair do app
5. **HTTPS em produção** (obrigatório)

## Troubleshooting

### Erro: "User not authenticated"

**Solução:**
1. Verificar se email foi confirmado
2. Fazer logout e login novamente
3. Limpar localStorage do navegador

### Erro: "Row level security policy violation"

**Solução:**
1. Verificar se migration 006 foi executada
2. Confirmar que `user_id` está sendo passado nos inserts
3. Verificar policies no Supabase Dashboard

### Dados não aparecem após login

**Causa:** Dados criados antes de adicionar autenticação não têm `user_id`

**Solução:**
```sql
-- Associar registros antigos ao primeiro usuário (CUIDADO!)
UPDATE records SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE children SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
```

### Erro: "Invalid login credentials"

**Causas:**
- Email ou senha incorretos
- Email não confirmado
- Conta não existe

**Solução:**
1. Verificar email e senha
2. Confirmar email (check inbox/spam)
3. Criar nova conta se necessário

## Testando Autenticação

### Teste Local

```bash
# 1. Rodar app
npm run dev

# 2. Acessar http://localhost:3000
# → Deve redirecionar para /login

# 3. Criar conta em /signup
# → Verificar email

# 4. Confirmar email (link)

# 5. Login em /login
# → Deve entrar na home ✅

# 6. Adicionar registro
# → Deve salvar com user_id ✅

# 7. Logout (UserMenu)
# → Deve voltar para /login ✅
```

### Verificar RLS

```sql
-- No SQL Editor do Supabase
-- Como usuário X, não deve ver dados de usuário Y

SELECT * FROM records;  -- Só seus registros
SELECT * FROM children; -- Só suas crianças
```

## Melhorias Futuras

- [ ] Login com Google/Facebook (OAuth)
- [ ] Recuperação de senha
- [ ] Alteração de email
- [ ] Two-factor authentication (2FA)
- [ ] Magic Link login
- [ ] Sessões ativas (device management)
- [ ] Logs de auditoria

---

**Documentação atualizada em:** 07/11/2025  
**Versão:** 1.9.0
