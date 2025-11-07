# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.8.2] - 2025-11-07

### 🐛 Corrigido

- **EditRecordModal**: Campos de temperatura e tipo de sintoma agora aparecem ao editar sintomas
  - Tipo de sintoma editável via dropdown
  - Campo de temperatura (°C) com validação
  - Campos condicionais (apenas para sintomas)
  - Salvamento correto dos dados de sintomas

---

## [1.8.1] - 2025-11-07

### 🔧 Melhorado

- **Responsividade Mobile**: Interface otimizada para dispositivos móveis
  - Lista de registros em cards no mobile (tabela no desktop)
  - Gráfico de temperatura adaptado (altura reduzida, labels angulados)
  - Estatísticas empilhadas verticalmente no mobile
  - Botões full-width nos lembretes de medicação (mobile)
  - Eixos do gráfico otimizados para telas pequenas
  - Labels de referência simplificadas
  - Dark mode em todos os componentes responsivos

### 🎨 UX/UI

- **Design Modernizado dos Cards Mobile**:
  - Gradientes coloridos no header (laranja para sintomas, azul para medicações)
  - Borda lateral colorida (4px) como indicador visual
  - Badges com emojis (🌡️ Sintoma / 💊 Medicação)
  - Ícones com background arredondado e sombra
  - Data em chip com ícone de calendário
  - Temperatura destacada em badge vermelho
  - Notas em bloco âmbar com borda lateral
  - Fotos em aspect-ratio 16:9 com overlay "Ver foto"
  - Botões com hover colorido (azul para editar, vermelho para excluir)
  - Sombras e transições suaves
  - Hierarquia visual clara e moderna
- Gráfico com scroll horizontal se necessário
- Margens ajustadas para melhor uso do espaço

---

## [1.8.0] - 2025-11-07

### ✨ Adicionado

- **Anexar Fotos aos Registros**: Upload e visualização de imagens
  - Componente `ImageUpload` com preview e remoção
  - Upload para Supabase Storage (bucket `record-photos`)
  - Validação de tipo (somente imagens) e tamanho (máx 5MB)
  - Preview em miniatura na lista de registros
  - Click para abrir imagem em tamanho real
  - Suporte no formulário de criação e edição
  - Coluna `photo_url` na tabela de registros
  
### 🔧 Melhorado

- **RecordForm**: Campo de upload de foto integrado
- **RecordList**: Coluna com miniatura ou ícone de foto
- **EditRecordModal**: Edição de fotos nos registros existentes
- **Storage**: Bucket público com RLS policies

### 🗄️ Database

- Migration `005_add_photos_support.sql`
- Campo `photo_url` em `records`
- Storage bucket `record-photos` com policies

---

## [1.7.0] - 2025-11-07

### ✨ Adicionado

- **Dark Mode**: Tema escuro com alternância
  - Componente `ThemeProvider` para gerenciar tema global
  - Componente `ThemeToggle` com ícones Sol/Lua
  - Persistência no localStorage
  - Detecção automática da preferência do sistema
  - Transições suaves entre temas
  - Botão de alternância no header da home
  
### 🔧 Melhorado

- **Layout**: Wrapper com ThemeProvider no root layout
- **Cores**: Variáveis CSS já configuradas para dark mode (Tailwind v4)
- **UX**: Ícones intuitivos (🌙 escuro / ☀️ claro)
- **Acessibilidade**: `suppressHydrationWarning` para evitar flash

---

## [1.6.0] - 2025-11-07

### ✨ Adicionado

- **PWA (Progressive Web App)**: Aplicativo instalável
  - Configuração completa com `next-pwa`
  - Arquivo `manifest.json` com metadata do app
  - Service Worker para cache offline
  - Ícones para instalação (192x192 e 512x512)
  - Meta tags para iOS e Android
  - Shortcuts para ações rápidas (Adicionar Sintoma/Medicação)
  - Funciona offline após primeira visita
  
### 🔧 Melhorado

- **Layout**: Meta tags PWA (theme-color, apple-web-app-capable)
- **Config**: next.config.ts configurado com withPWA
- **Ícones**: SVG base para geração de ícones
- **Gitignore**: Arquivos do service worker excluídos

### 📦 Dependências

- Adicionado `next-pwa` v5.6.0

### 📚 Documentação

- `docs/PWA_ICONS.md`: Guia para gerar ícones
- `GERAR_ICONES_PWA.md`: Instruções rápidas
- SVG template em `public/icon.svg`

---

## [1.5.0] - 2025-11-07

### ✨ Adicionado

- **Sistema de Lembretes de Medicação**: Alertas automáticos para próxima dose
  - Checkbox "Ativar lembrete" no formulário de medicação
  - Campo de intervalo entre doses (em horas)
  - Cálculo automático da próxima dose via trigger no banco
  - Card de lembretes pendentes na home (atualiza a cada minuto)
  - Botão "Aplicada" para registrar dose rapidamente
  - Indicadores visuais de urgência (cores por tempo de atraso)
  - Componente `MedicationReminders` com lista de pendências
  
### 🔧 Melhorado

- **RecordForm**: Campos de lembrete para medicações
- **HomePage**: Exibe lembretes no topo quando há doses pendentes
- **UX**: Cores intuitivas (vermelho=urgente, laranja=recente, amarelo=atrasado)

### 📦 Banco de Dados

- Nova migration `004_add_medication_reminders.sql`
- Campos: `reminder_interval_hours`, `reminder_enabled`, `next_dose_at`
- Function `calculate_next_dose()` para cálculo automático
- Triggers para atualizar `next_dose_at` em insert/update
- Índices para queries otimizadas de lembretes

---

## [1.4.0] - 2025-11-07

### ✨ Adicionado

- **Suporte para Múltiplas Crianças**: Sistema completo de gerenciamento de crianças
  - Nova tabela `children` no banco de dados
  - Página de gerenciamento de crianças (`/children`)
  - Adicionar, editar, ativar/desativar crianças
  - Seletor de criança na página inicial
  - Filtro automático de registros por criança
  - Persistência da criança selecionada (localStorage)
  - Campo `child_id` em todos os registros
  
- **Componentes Novos**:
  - `ChildSelector`: Seletor dropdown de crianças
  - Páginas de gerenciamento em `/children`
  - CRUD completo de crianças

### 🔧 Melhorado

- **HomePage**: Filtro automático por criança selecionada
- **RecordForm**: Associa automaticamente registros à criança atual
- **Realtime**: Subscrição a mudanças na tabela de crianças
- **UX**: Mensagem quando nenhuma criança está cadastrada

### 📦 Banco de Dados

- Nova migration `003_add_children_support.sql`
- Tabela `children` (id, name, birth_date, photo_url, notes, is_active)
- Campo `child_id` em `records` com foreign key
- Índices e policies RLS
- CASCADE delete (excluir criança remove seus registros)

---

## [1.3.0] - 2025-11-07

### ✨ Adicionado

- **Tipos de Sintomas Predefinidos**: Sistema de categorização de sintomas
  - 10 tipos: Febre, Tosse, Congestão Nasal, Diarreia, Vômito, Dor de Cabeça, Dor de Barriga, Irritação, Falta de Apetite, Outro
  - Cada tipo com emoji identificador
  - Campo `symptom_type` no banco de dados
  - Select de tipo no formulário de sintomas
  
- **Campo de Temperatura Dedicado**: Novo campo `temperature` no banco
  - Entrada numérica específica para febre (35-42°C)
  - Auto-preenchimento do campo detalhes
  - Validação de valores razoáveis
  - Gráfico usa campo dedicado quando disponível

### 🔧 Melhorado

- **Detecção de Temperatura**: Regex melhorada para aceitar números inteiros
  - Agora reconhece "38", "38°C", "Febre de 38", etc.
  - Suporte a decimais e inteiros
  - Compatibilidade retroativa com registros antigos
  
- **Interface do Formulário**: UX aprimorada e simplificada para sintomas
  - Seleção de tipo obrigatória
  - Campo de temperatura aparece apenas para febre
  - **Removidos campos redundantes**: Título e Detalhes são preenchidos automaticamente
  - Apenas 2-3 campos para sintomas (tipo + temperatura/observações)
  - Medicações mantêm campos completos
  - Labels e placeholders contextuais

### 📦 Banco de Dados

- Nova migration `002_add_symptom_fields.sql`
- Colunas adicionadas: `symptom_type`, `temperature`
- Constraints e validações
- Índices para performance

---

## [1.2.1] - 2025-11-07

### 🐛 Corrigido

- **Atualização de Gráficos**: Gráficos agora atualizam automaticamente após adicionar registros
  - Implementado Supabase Realtime para atualização automática
  - Página inicial convertida para client component
  - Adicionado botão de refresh manual
  - Delay de 300ms antes de redirect para garantir persistência

### ✨ Adicionado

- **Atualização em Tempo Real**: Dados sincronizam automaticamente via Supabase Realtime
- **Botão de Refresh**: Ícone de atualização manual no header
- **Indicador de Carregamento**: Animação spinning durante refresh
- Documentação completa em `docs/ATUALIZACAO_TEMPO_REAL.md`

---

## [1.2.0] - 2025-11-07

### ✨ Adicionado

- **Gráficos de Temperatura**: Visualização da evolução da temperatura ao longo do tempo
  - Novo componente `TemperatureChart.tsx` com Recharts
  - Detecção automática de valores de temperatura nos registros
  - Estatísticas (média, máxima, mínima)
  - Linhas de referência para temperatura normal (37°C) e febre (37.8°C)
  - Gráfico de linha interativo com tooltips
  - Página dedicada `/charts` para visualização completa
  - Gráfico também exibido na página inicial

### 🔧 Melhorado

- Extração inteligente de temperatura de múltiplos formatos:
  - "38.5°C", "38,5", "Temperatura: 38.5°C"
  - Validação de valores razoáveis (35-42°C)
- Navegação aprimorada com botão "Gráficos" no header

### 📦 Dependências

- Adicionado `recharts` para visualização de dados

---

## [1.1.0] - 2025-11-07

### ✨ Adicionado

- **Edição de Registros**: Modal para editar sintomas e medicações existentes
  - Novo componente `EditRecordModal.tsx`
  - Botão de editar (ícone de lápis) na lista de registros
  - Modal com formulário pré-preenchido
  - Atualização em tempo real após salvar
  - Validação de campos obrigatórios

### 🔧 Melhorado

- Componente `RecordList` agora suporta edição além de exclusão
- Largura da coluna "Ações" aumentada para acomodar dois botões
- Títulos adicionados aos botões de ação (tooltips nativos)
- Feedback visual durante operações de edição

### 📚 Documentação

- README atualizado com instruções de edição
- PROXIMOS_PASSOS.md marcando a feature como completa
- Adicionado este CHANGELOG.md

---

## [1.0.0] - 2025-11-07

### 🎉 Release Inicial

- Registrar sintomas e medicações
- Visualizar histórico completo
- Filtrar por intervalo de datas
- Exportar relatórios em PDF e CSV
- Excluir registros
- Interface responsiva com design em tons pastéis
- Integração com Supabase
- Componentes shadcn/ui
