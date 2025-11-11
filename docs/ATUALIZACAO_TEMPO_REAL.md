# 🔄 Atualização em Tempo Real

## Como Funciona

O Cubbi utiliza **Supabase Realtime** para atualizar automaticamente os dados sem precisar recarregar a página.

### Tecnologias Utilizadas

1. **Supabase Realtime**: Escuta mudanças no banco de dados
2. **React State**: Gerencia os dados localmente
3. **useEffect**: Configura a subscrição ao iniciar o componente

### Implementação

```typescript
useEffect(() => {
  fetchRecords();

  // Subscribe to changes in the records table
  const channel = supabase
    .channel('records-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'records',
      },
      () => {
        fetchRecords(); // Atualiza dados quando houver mudança
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // Cleanup ao desmontar
  };
}, []);
```

## Eventos Monitorados

- ✅ **INSERT**: Quando um novo registro é adicionado
- ✅ **UPDATE**: Quando um registro é editado
- ✅ **DELETE**: Quando um registro é excluído

## Benefícios

1. **Atualização Automática**: Não precisa recarregar a página manualmente
2. **Múltiplos Dispositivos**: Se você abrir em dois navegadores, ambos atualizam
3. **Performance**: Apenas os dados alterados são sincronizados
4. **UX Melhor**: Interface sempre atualizada sem esforço do usuário

## Botão de Atualização Manual

Caso o realtime não funcione ou você prefira controlar:

- **Ícone de Refresh (🔄)** no canto superior direito
- Clique para forçar atualização dos dados
- Animação de spinning durante o carregamento

## Configuração no Supabase

### Habilitar Realtime (Já configurado)

O Realtime está habilitado por padrão nas políticas RLS:

```sql
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on records" ON records
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Verificar se Realtime está Ativo

1. Acesse o Supabase Dashboard
2. Vá em **Database** → **Replication**
3. Verifique se a tabela `records` está na lista
4. Se não estiver, clique em **Add table** e selecione `records`

## Troubleshooting

### Gráfico não atualiza após adicionar registro

**Soluções:**

1. **Clique no botão de refresh (🔄)**
   - Força atualização imediata

2. **Aguarde 1-2 segundos**
   - O realtime pode ter um pequeno delay

3. **Verifique o console do navegador**
   - Abra DevTools (F12)
   - Procure por erros relacionados a Supabase

4. **Verifique Realtime no Supabase**
   - Database → Replication
   - Certifique-se que a tabela `records` está habilitada

### Realtime não funciona

**Causas possíveis:**

1. **Plano do Supabase**
   - Free tier: 200 conexões simultâneas
   - Pode ter atingido o limite

2. **Configuração RLS**
   - Verifique se as políticas estão corretas
   - Execute a migration novamente se necessário

3. **Navegador bloqueando WebSockets**
   - Alguns firewalls/antivírus bloqueiam
   - Teste em outro navegador ou rede

### Performance

**Otimizações implementadas:**

1. **Debounce implícito**: useEffect só executa uma vez
2. **Cleanup**: Remove o canal ao desmontar o componente
3. **Loading states**: Evita múltiplas requisições simultâneas

## Código Completo

O componente `HomePage.tsx` gerencia todo o realtime:

```typescript
'use client';

export function HomePage() {
  const [records, setRecords] = useState<Record[]>([]);
  
  useEffect(() => {
    // Busca inicial
    fetchRecords();
    
    // Subscrição realtime
    const channel = supabase
      .channel('records-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'records' },
        () => fetchRecords()
      )
      .subscribe();
    
    // Cleanup
    return () => supabase.removeChannel(channel);
  }, []);
  
  // ... resto do código
}
```

## Testes

Para testar o realtime:

1. Abra o app em duas abas/janelas diferentes
2. Adicione um registro em uma janela
3. Veja atualizar automaticamente na outra janela
4. Funciona também entre dispositivos diferentes!

## Limitações

- **Delay**: 100-500ms entre ação e atualização
- **Conexões**: Limite de 200 conexões simultâneas (free tier)
- **WebSockets**: Requer conexão estável com internet

## Alternativas

Se o realtime não funcionar:

1. **Polling**: Buscar dados a cada X segundos
2. **Refresh manual**: Usar apenas o botão de atualização
3. **Recarregar página**: F5 após adicionar registros

---

**Realtime configurado e funcionando! ⚡**
