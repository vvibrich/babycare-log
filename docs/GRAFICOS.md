# 📊 Gráficos - Documentação

## Gráfico de Temperatura

O Cubbi possui um gráfico interativo que mostra a evolução da temperatura ao longo do tempo.

### 🎯 Funcionalidades

1. **Detecção Automática de Temperatura**
   - O sistema extrai automaticamente valores de temperatura dos sintomas
   - Formatos aceitos:
     - `38.5°C`
     - `38,5 graus`
     - `Temperatura: 38.5`
     - `38.7`
   - Validação: apenas valores entre 35°C e 42°C são considerados

2. **Estatísticas**
   - **Média**: Temperatura média de todas as medições
   - **Máxima**: Maior temperatura registrada
   - **Mínima**: Menor temperatura registrada

3. **Linhas de Referência**
   - **Verde (37°C)**: Temperatura corporal normal
   - **Laranja (37.8°C)**: Limite para considerar febre

4. **Gráfico Interativo**
   - Passe o mouse sobre os pontos para ver detalhes
   - Eixo X: Data e hora da medição
   - Eixo Y: Temperatura em graus Celsius
   - Linha azul conecta todas as medições

### 📍 Onde Encontrar

1. **Página Inicial**: Gráfico exibido entre os botões de ação e a lista de registros
2. **Página de Gráficos**: Acesse via botão "Gráficos" no menu superior (`/charts`)

### 💡 Dicas de Uso

#### Como Registrar para o Gráfico Funcionar

Ao adicionar um sintoma de febre, preencha o campo "Detalhes" com a temperatura:

**Exemplos corretos:**
- `38.5°C` ✅
- `Temperatura 38.7` ✅
- `38,5 graus` ✅
- `Febre de 38.2°C` ✅

**Exemplos que funcionam mas são menos ideais:**
- `38.5` (funciona, mas melhor adicionar a unidade)

**O que NÃO funciona:**
- `Alta` ❌
- `Muito quente` ❌
- `Febre` (sem número) ❌

#### Melhores Práticas

1. **Seja consistente**: Use sempre o mesmo formato (ex: `38.5°C`)
2. **Meça regularmente**: Quanto mais medições, mais útil o gráfico
3. **Registre imediatamente**: Não esqueça de anotar logo após medir
4. **Use decimais**: `38.5°C` é mais preciso que `38°C` ou `39°C`

### 🔧 Como Funciona Tecnicamente

#### Extração de Temperatura

```typescript
// O sistema usa regex para encontrar padrões
const patterns = [
  /(\d+[.,]\d+)\s*°?\s*c/i,      // 38.5°C
  /(\d+[.,]\d+)\s*graus?/i,       // 38.5 graus
  /temperatura[:\s]+(\d+[.,]\d+)/i, // Temperatura: 38.5
  /(\d+[.,]\d+)/,                 // 38.5
];
```

#### Validação

Apenas temperaturas entre 35°C e 42°C são aceitas, pois:
- Abaixo de 35°C: Hipotermia severa (improvável em uso normal)
- Acima de 42°C: Hipertermia extrema (emergência médica)

### 🎨 Cores e Design

- **Azul (#3b82f6)**: Linha principal do gráfico
- **Verde (#10b981)**: Linha de temperatura normal
- **Laranja (#f59e0b)**: Linha de febre
- **Vermelho**: Estatística de máxima
- **Verde**: Estatística de mínima
- **Azul**: Estatística de média

### 🚀 Próximas Melhorias Possíveis

- [ ] Gráfico de frequência de medicações
- [ ] Comparação de sintomas ao longo do tempo
- [ ] Exportar gráfico como imagem
- [ ] Filtrar gráfico por intervalo de datas
- [ ] Alertas quando temperatura ultrapassar limites
- [ ] Gráfico de barras com medicações e sintomas juntos

### 📝 Exemplos de Uso Real

#### Cenário 1: Acompanhamento de Febre
```
Dia 1 - 08:00: 38.2°C
Dia 1 - 14:00: 38.7°C (após medicação)
Dia 1 - 20:00: 37.5°C (melhorando)
Dia 2 - 08:00: 37.1°C (normal)
```

O gráfico mostrará claramente:
- Pico de temperatura às 14h
- Efeito da medicação
- Retorno à normalidade

#### Cenário 2: Monitoramento Pós-Vacina
```
Antes: 36.8°C (normal)
+2h: 37.5°C (leve aumento)
+6h: 38.0°C (febre leve)
+12h: 37.2°C (melhorando)
+24h: 36.9°C (normal)
```

O gráfico ajuda a visualizar a reação normal à vacina.

### ❓ FAQ

**P: Por que minha temperatura não aparece no gráfico?**
R: Verifique se usou um dos formatos aceitos e se o valor está entre 35-42°C.

**P: Posso editar uma temperatura já registrada?**
R: Sim! Use o botão de editar (✏️) ao lado do registro e altere o campo "Detalhes".

**P: O gráfico funciona offline?**
R: Não, precisa de conexão para buscar os dados do Supabase.

**P: Quantas medições são necessárias para o gráfico funcionar?**
R: Pelo menos 1, mas fica mais útil com 3 ou mais medições.

---

**Desenvolvido com ❤️ usando Recharts**
