# 👥 Compartilhamento de Crianças

## Visão Geral

O Cubbi permite que múltiplos responsáveis acessem os dados de uma mesma criança através de um sistema de convites e permissões.

## Níveis de Acesso

### 👑 Owner (Proprietário)
- **Controle total** sobre a criança
- Adicionar e remover registros
- Editar dados da criança
- Convidar outros responsáveis
- Remover acesso de outros
- Deletar a criança

### ✏️ Editor
- Ver todos os registros
- Adicionar novos registros
- Editar registros existentes
- **Não pode:**
  - Convidar outras pessoas
  - Remover acesso
  - Deletar a criança

### 👁️ Viewer (Visualizador)
- Apenas **visualizar** dados
- Ver registros, gráficos e relatórios
- Exportar relatórios
- **Não pode:**
  - Adicionar ou editar registros
  - Convidar outras pessoas
  - Alterar dados da criança

---

## Como Funciona

### 1️⃣ Convidar um Responsável

**Passo a passo:**

1. Vá em **Gerenciar Crianças** → Clique no ícone 👥 (Gerenciar Acesso)
2. Click em **"Convidar"**
3. Preencha:
   - **Email** do responsável
   - **Nível de acesso** (Editor ou Visualizador)
   - **Mensagem** opcional
4. Click em **"Enviar Convite"**

**O que acontece:**
- Convite é criado no sistema
- Válido por **7 dias**
- Destinatário verá convite ao fazer login com aquele email

### 2️⃣ Receber e Aceitar Convite

**Passo a passo:**

1. Faça **login** com o email que recebeu o convite
2. Convite aparece na **home** (card azul "Convites Pendentes")
3. Veja detalhes: criança, nível de acesso, mensagem
4. Click em:
   - ✅ **"Aceitar"** - Ganha acesso à criança
   - ❌ **"Recusar"** - Rejeita o convite

**Após aceitar:**
- Criança aparece no seletor
- Você pode ver/editar dados (conforme permissão)
- Acesso permanente (até ser removido)

### 3️⃣ Gerenciar Responsáveis

**Apenas Owners podem:**

1. Ver lista de todos os responsáveis
2. Ver convites pendentes
3. Remover acesso de qualquer pessoa (exceto a si mesmo)
4. Cancelar convites não aceitos

**Como remover acesso:**

1. Vá em **Gerenciar Acesso** da criança
2. Click no **X** ao lado do responsável
3. Confirme a remoção
4. Responsável perde acesso imediatamente

---

## Casos de Uso

### Pais Compartilhando

```
Mãe (Owner)
  ↓ Convida
Pai (Editor)
```

Ambos podem adicionar registros de sintomas, medicações, etc.

### Avós como Visualizadores

```
Mãe (Owner)
  ↓ Convida
Avó (Viewer)
```

Avó pode ver registros mas não altera nada.

### Babá Temporária

```
Pai (Owner)
  ↓ Convida
Babá (Editor)
  ↓ Depois remove acesso
```

Babá pode adicionar registros enquanto cuida da criança. Depois, perde acesso.

---

## Segurança

### Row Level Security (RLS)

**Isolamento por permissão:**
- Cada tabela verifica permissões
- Queries filtram automaticamente
- Impossível acessar dados sem permissão

**Exemplo:**

```sql
-- Owner vê tudo
SELECT * FROM records WHERE child_id = 'uuid';

-- Editor vê e edita
UPDATE records SET ... WHERE child_id = 'uuid' AND (owner OR editor);

-- Viewer apenas vê
SELECT * FROM records WHERE child_id = 'uuid' AND (owner OR editor OR viewer);
```

### Validações

✅ **Não pode convidar a si mesmo**
✅ **Não pode ter convite duplicado**
✅ **Convites expiram em 7 dias**
✅ **Apenas Owner pode remover acesso**
✅ **Não pode remover próprio acesso de Owner**

---

## Perguntas Frequentes

### Posso transferir ownership?

Não diretamente. Você pode:
1. Convidar a pessoa como Editor
2. Ela cria uma nova criança com mesmo nome
3. Copia registros manualmente

### Quantas pessoas podem ter acesso?

**Ilimitado!** Você pode convidar quantas pessoas quiser.

### E se eu deletar minha conta?

Se você é único Owner, a criança será deletada (ON DELETE CASCADE).

Se há outros Owners, eles mantêm acesso.

### Convite expira e depois?

Pode enviar novo convite! Sem limite de reenvios.

### Posso mudar nível de acesso depois?

Atualmente não. Você precisa:
1. Remover acesso
2. Enviar novo convite com nível desejado

*(Feature futura: editar role)*

---

## Troubleshooting

### Convite não aparece

**Causas:**
- Email diferente do cadastrado
- Convite já expirou (>7 dias)
- Convite foi cancelado

**Solução:**
- Confirmar email correto
- Pedir novo convite

### Não consigo adicionar registro

**Causa:** Você é Viewer (apenas visualiza)

**Solução:** Pedir ao Owner para:
- Trocar seu nível para Editor, ou
- Fazer você Owner também

### Responsável sumiu da lista

**Causa:** Owner removeu seu acesso

**Solução:** Conversar com Owner para entender motivo

---

## Migrations

### Aplicar em Produção

```sql
-- Execute: 007_add_child_sharing.sql
```

**O que faz:**
1. Cria `child_access` (many-to-many)
2. Cria `child_invites` (convites)
3. Popula acessos existentes como Owner
4. Atualiza RLS policies
5. Cria funções SQL

**Seguro?** Sim! Migra dados existentes automaticamente.

---

## Estrutura do Banco

### Tabelas

```
children (criança)
   ↓ 1:N
child_access (acesso)
   ↓ N:1
auth.users (responsável)

children
   ↓ 1:N
child_invites (convite)
   ↓ N:1
auth.users (convidado)
```

### child_access

| Campo      | Tipo    | Descrição             |
|------------|---------|-----------------------|
| id         | UUID    | PK                    |
| child_id   | UUID    | FK → children         |
| user_id    | UUID    | FK → auth.users       |
| role       | TEXT    | owner/editor/viewer   |
| granted_by | UUID    | Quem deu o acesso     |
| granted_at | TIMESTAMP | Quando foi concedido |

### child_invites

| Campo          | Tipo    | Descrição             |
|----------------|---------|-----------------------|
| id             | UUID    | PK                    |
| child_id       | UUID    | FK → children         |
| inviter_id     | UUID    | Quem convidou         |
| invitee_email  | TEXT    | Email do convidado    |
| invitee_id     | UUID    | Preenchido ao aceitar |
| role           | TEXT    | editor/viewer         |
| status         | TEXT    | pending/accepted/... |
| message        | TEXT    | Mensagem opcional     |
| expires_at     | TIMESTAMP | Data de expiração   |

---

## Componentes

- **`InviteUserDialog`** - Dialog para enviar convites
- **`ManageChildAccess`** - Gerenciar responsáveis e convites
- **`PendingInvites`** - Card mostrando convites pendentes

---

**Versão:** 1.11.0  
**Atualizado em:** 07/11/2025
