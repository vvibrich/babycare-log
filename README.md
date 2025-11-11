# 👶 Cubbi

Sistema web para registrar, visualizar e exportar sintomas e medicações de crianças.

## 🚀 Stack Técnica

- **Next.js 15** com App Router
- **TypeScript**
- **shadcn/ui** - Componentes UI
- **Supabase** - Banco de dados
- **Tailwind CSS** - Estilização
- **jsPDF** - Geração de relatórios PDF
- **Recharts** - Gráficos interativos
- **date-fns** - Formatação de datas
- **Lucide React** - Ícones

## 📋 Funcionalidades

- ✅ Registrar sintomas com tipos predefinidos (febre, tosse, congestão, etc.)
- ✅ Campo dedicado de temperatura para febre (aceita inteiros e decimais)
- ✅ Registrar medicações (nome, dose, observações)
- ✅ Visualizar histórico completo em ordem cronológica
- ✅ Editar registros existentes via modal
- ✅ Gráfico de temperatura ao longo do tempo
- ✅ Estatísticas de temperatura (média, máxima, mínima)
- ✅ Filtrar registros por intervalo de datas
- ✅ Exportar relatórios em PDF
- ✅ Exportar relatórios em CSV
- ✅ Excluir registros
- ✅ Interface responsiva e amigável
- ✅ **PWA**: Aplicativo instalável (funciona offline)
- ✅ **Fotos**: Anexar imagens aos registros (até 5MB)
- ✅ **Autenticação**: Login seguro com email e senha
- ✅ **Multi-usuário**: Dados isolados por usuário (RLS)
- ✅ **Compartilhamento**: Múltiplos responsáveis por criança
  - Sistema de convites por email
  - Níveis de acesso (Owner, Editor, Visualizador)
  - Gerenciamento de permissões

## 🛠️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

#### Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anon key do projeto

#### Executar Migration

Execute o SQL em **SQL Editor** no Supabase:

```sql
-- O conteúdo está em: supabase/migrations/001_create_records_table.sql
```

Ou use o Supabase CLI:

```bash
npx supabase db push
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 4. Executar o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 4. Gerar Ícones PWA (Opcional mas Recomendado)

Para que o aplicativo seja instalável com ícone personalizado:

1. Acesse: https://realfavicongenerator.net/
2. Faça upload do `public/icon.svg`
3. Baixe os ícones gerados
4. Renomeie para `icon-192.png` e `icon-512.png`
5. Coloque na pasta `public/`

Veja mais detalhes em `GERAR_ICONES_PWA.md`

## 📁 Estrutura do Projeto

```
├── app/
│   ├── page.tsx                 # Página inicial (lista de registros)
│   ├── add/
│   │   ├── symptom/page.tsx     # Formulário de sintoma
│   │   └── medication/page.tsx  # Formulário de medicação
│   ├── charts/page.tsx          # Página de gráficos
│   └── report/page.tsx          # Página de relatórios
├── components/
│   ├── RecordForm.tsx           # Formulário reutilizável
│   ├── RecordList.tsx           # Lista de registros
│   ├── EditRecordModal.tsx      # Modal de edição
│   ├── TemperatureChart.tsx     # Gráfico de temperatura
│   └── DateRangePicker.tsx      # Seletor de período
├── lib/
│   ├── supabaseClient.ts        # Cliente Supabase
│   └── generateReport.ts        # Geração de PDF/CSV
├── types/
│   └── record.ts                # Tipos TypeScript
├── utils/
│   └── formatDate.ts            # Formatação de datas
└── supabase/
    └── migrations/
        └── 001_create_records_table.sql  # Schema do banco
```

## 🗄️ Schema do Banco de Dados

Tabela `records`:

| Campo      | Tipo        | Descrição                      |
|------------|-------------|--------------------------------|
| id         | uuid        | Primary Key                    |
| type       | text        | 'symptom' ou 'medication'      |
| title      | text        | Nome do sintoma/medicação      |
| details    | text        | Temperatura, dose, etc.        |
| notes      | text        | Observações (opcional)         |
| created_at | timestamptz | Data/hora do registro          |

## 🎨 Design

- **Cores**: Tons pastéis (azul, lilás, rosa)
- **Tipografia**: Inter (via Next.js font optimization)
- **Ícones**: Lucide React
  - 🤒 (Thermometer) para sintomas
  - 💊 (Pill) para medicações

## 📝 Como Usar

1. **Adicionar Sintoma**: Clique em "Adicionar Sintoma", preencha os dados e salve
2. **Adicionar Medicação**: Clique em "Adicionar Medicação", preencha os dados e salve
3. **Visualizar Histórico**: Todos os registros aparecem na página inicial
4. **Ver Gráficos**: 
   - Acesse "Gráficos" no menu superior
   - Veja o gráfico de temperatura ao longo do tempo
   - Analise estatísticas (média, máxima, mínima)
5. **Editar Registro**: Clique no ícone de lápis (✏️) ao lado do registro, altere os dados no modal e salve
6. **Excluir Registro**: Clique no ícone de lixeira (🗑️) ao lado do registro e confirme
7. **Gerar Relatório**: 
   - Acesse "Relatórios"
   - Selecione a criança
   - Selecione o período desejado (opcional)
   - Clique em "Exportar PDF" ou "Exportar CSV"

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel deploy
```

Lembre-se de adicionar as variáveis de ambiente no painel da Vercel.

## 📄 Licença

MIT
