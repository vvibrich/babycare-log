# 🤒 Tipos de Sintomas

## Visão Geral

O BabyCare Log possui um sistema de categorização de sintomas que facilita o registro e a organização dos dados.

## 📋 Tipos Disponíveis

| Tipo | Emoji | Descrição | Campo Especial |
|------|-------|-----------|----------------|
| Febre | 🤒 | Temperatura elevada | ✅ Campo de temperatura |
| Tosse | 😷 | Tosse seca ou com catarro | - |
| Congestão Nasal | 🤧 | Nariz entupido | - |
| Diarreia | 💩 | Evacuação líquida | - |
| Vômito | 🤮 | Náusea e vômito | - |
| Dor de Cabeça | 🤕 | Cefaleia | - |
| Dor de Barriga | 😣 | Dor abdominal | - |
| Irritação/Choro | 😤 | Choro excessivo ou irritabilidade | - |
| Falta de Apetite | 🍽️ | Recusa alimentar | - |
| Outro | 📝 | Outros sintomas não categorizados | - |

## 🎯 Como Usar

### Registrando Febre

1. Acesse "Adicionar Sintoma"
2. Selecione "🤒 Febre" no tipo de sintoma
3. Digite a temperatura (ex: 38 ou 38.5)
   - Aceita valores entre 35°C e 42°C
   - Pode ser número inteiro ou decimal
4. Adicione observações se necessário (opcional)
5. Salve

**Campos preenchidos automaticamente:**
- Título: "Febre"
- Detalhes: "38°C" ou "38.5°C"

**Exemplos:**
- `38` → Salva como 38.0°C
- `38.5` → Salva como 38.5°C
- `38.7` → Salva como 38.7°C

### Registrando Outros Sintomas

1. Acesse "Adicionar Sintoma"
2. Selecione o tipo apropriado (ex: "😷 Tosse")
3. Adicione observações (opcional, mas recomendado)
   - Ex: "Tosse seca noturna"
   - Ex: "Muito choro, não quer mamar"
4. Salve

**Campos preenchidos automaticamente:**
- Título: Nome do sintoma (ex: "Tosse")
- Detalhes: Cópia das observações ou nome do sintoma

## 🔧 Estrutura Técnica

### Banco de Dados

```sql
symptom_type TEXT CHECK (symptom_type IN (
  'febre', 'tosse', 'congestao_nasal', 'diarreia',
  'vomito', 'dor_cabeca', 'dor_barriga', 'irritacao',
  'falta_apetite', 'outro'
))

temperature NUMERIC(4,2) CHECK (
  temperature IS NULL OR 
  (temperature >= 35 AND temperature <= 42)
)
```

### TypeScript

```typescript
export type SymptomType = 
  | 'febre'
  | 'tosse'
  | 'congestao_nasal'
  | 'diarreia'
  | 'vomito'
  | 'dor_cabeca'
  | 'dor_barriga'
  | 'irritacao'
  | 'falta_apetite'
  | 'outro';
```

## 📊 Benefícios

### 1. **Padronização**
- Dados consistentes e organizados
- Fácil identificação visual com emojis
- Melhor para análise e relatórios

### 2. **Facilidade de Uso**
- Seleção rápida ao invés de digitação
- Menos erros de ortografia
- Interface mais intuitiva

### 3. **Campo Dedicado de Temperatura**
- Validação automática
- Formato consistente
- Gráficos mais precisos
- Suporta inteiros (38) e decimais (38.5)

### 4. **Análise de Dados**
- Filtrar por tipo de sintoma
- Estatísticas por categoria
- Padrões identificáveis

## 🎨 Interface

### Formulário de Sintoma (Simplificado)

**Para Febre:**
```
┌─ Tipo de Sintoma * ────────────────┐
│ [🤒 Febre                      ▼] │
└────────────────────────────────────┘
┌─ Temperatura (°C) * ───────────────┐
│ [38.5                           ]  │
│ Digite a temperatura medida        │
└────────────────────────────────────┘
┌─ Observações (opcional) ───────────┐
│ [Após mamada...                 ]  │
└────────────────────────────────────┘
```

**Para Outros Sintomas:**
```
┌─ Tipo de Sintoma * ────────────────┐
│ [😷 Tosse                      ▼] │
└────────────────────────────────────┘
┌─ Observações (opcional) ───────────┐
│ [Tosse seca noturna...          ]  │
└────────────────────────────────────┘
```

✨ **Título e Detalhes são preenchidos automaticamente!**

### Lista de Registros

```
┌──────┬────────────────┬─────────────┬──────────┐
│ Tipo │ Data/Hora      │ Título      │ Detalhes │
├──────┼────────────────┼─────────────┼──────────┤
│ 🤒   │ 07/11 14:30   │ 🤒 Febre   │ 38.5°C   │
│ 😷   │ 07/11 10:15   │ 😷 Tosse   │ Seca     │
│ 💊   │ 07/11 09:00   │ Paracetamol │ 10 gotas │
└──────┴────────────────┴─────────────┴──────────┘
```

## 🔄 Compatibilidade

### Registros Antigos

O sistema mantém compatibilidade total com registros criados antes da implementação de tipos:

- **Campo `title` livre**: Registros sem `symptom_type` continuam funcionando
- **Extração de temperatura**: Regex continua extraindo de `details` quando necessário
- **Visualização**: Ambos os formatos aparecem corretamente na lista

### Migração

Não é necessário migrar registros antigos. O sistema detecta automaticamente:

```typescript
// Novo formato
{
  symptom_type: 'febre',
  temperature: 38.5,
  title: 'Febre',
  details: '38.5°C'
}

// Formato antigo (ainda funciona)
{
  title: 'Febre',
  details: 'Temperatura de 38.5°C'
}
```

## 💡 Dicas de Uso

### Para Pais/Cuidadores

1. **Seja específico**: Use o tipo mais apropriado
2. **Registre imediatamente**: Não confie só na memória
3. **Use observações**: Adicione contexto (ex: "após mamada")
4. **Temperatura**: Sempre use o campo específico para febre

### Para Desenvolvedores

1. **Extensibilidade**: Adicionar novos tipos em `types/record.ts`
2. **Validação**: Constraints no banco garantem integridade
3. **Icons**: Emojis facilitam identificação visual
4. **TypeScript**: Types fortes previnem erros

## 🚀 Próximas Melhorias

- [ ] Análise por tipo de sintoma
- [ ] Gráfico de frequência de sintomas
- [ ] Alertas personalizados por tipo
- [ ] Sugestões de medicação por sintoma
- [ ] Histórico detalhado por tipo

---

**Sistema de tipos implementado com sucesso! 🎉**
