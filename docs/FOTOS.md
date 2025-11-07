# 📸 Sistema de Fotos

## Visão Geral

O BabyCare Log permite anexar fotos aos registros de sintomas e medicações. As imagens são armazenadas no Supabase Storage e referenciadas nos registros.

## Funcionalidades

### Upload de Fotos

- **Localização**: Formulário de criação e modal de edição
- **Formatos aceitos**: JPG, PNG, GIF, WebP, SVG
- **Tamanho máximo**: 5MB por imagem
- **Preview**: Visualização antes de salvar
- **Remoção**: Botão X para remover foto antes de salvar

### Visualização

- **Lista de registros**: Miniatura 48x48px
- **Click**: Abre imagem em tamanho real em nova aba
- **Sem foto**: Ícone de imagem em cinza

## Arquitetura Técnica

### Database

```sql
-- Campo na tabela records
photo_url TEXT

-- Armazena a URL pública da imagem no Supabase Storage
```

### Supabase Storage

**Bucket**: `record-photos`
- **Público**: Sim (URLs acessíveis sem autenticação)
- **RLS Policies**:
  - `SELECT`: Qualquer pessoa pode visualizar
  - `INSERT`: Apenas usuários autenticados
  - `UPDATE`: Apenas usuários autenticados
  - `DELETE`: Apenas usuários autenticados

### Componente ImageUpload

**Props:**
```typescript
interface ImageUploadProps {
  onImageUploaded: (url: string) => void;  // Callback com URL
  currentImageUrl?: string | null;          // URL atual (para edição)
  onImageRemoved?: () => void;              // Callback ao remover
}
```

**Validações:**
- Tipo de arquivo (apenas imagens)
- Tamanho máximo (5MB)
- Mensagens de erro amigáveis

**Processo de Upload:**
1. Usuário seleciona arquivo
2. Validação de tipo e tamanho
3. Geração de preview (FileReader)
4. Upload para Supabase Storage
5. Geração de URL pública
6. Callback com URL para o formulário

**Nome do arquivo:**
```javascript
`${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
// Exemplo: 1699887654321-abc123.jpg
```

## Fluxo de Uso

### Adicionar Foto (Criação)

```
1. Usuário acessa /add/symptom ou /add/medication
2. Preenche formulário normalmente
3. (Opcional) Clica na área de upload
4. Seleciona imagem do dispositivo
5. Preview aparece com botão X
6. Ao salvar formulário:
   - Se foto: URL é salva em photo_url
   - Se sem foto: photo_url é null
```

### Editar Foto (Edição)

```
1. Usuário clica em "Editar" na lista
2. Modal abre com dados do registro
3. Se registro tem foto: mostra preview
4. Pode remover foto existente (X)
5. Pode adicionar nova foto (upload)
6. Ao salvar: photo_url é atualizado
```

### Visualizar Foto

```
1. Lista de registros mostra miniaturas
2. Click na miniatura: abre em nova aba
3. Imagem em tamanho original
```

## Integração com Forms

### RecordForm (Criação)

```tsx
const [formData, setFormData] = useState({
  // ... outros campos
  photo_url: '' as string | null,
});

// No JSX:
<ImageUpload
  onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
  currentImageUrl={formData.photo_url}
  onImageRemoved={() => setFormData({ ...formData, photo_url: null })}
/>

// No submit:
insertData.photo_url = formData.photo_url || null;
```

### EditRecordModal (Edição)

```tsx
useEffect(() => {
  if (record) {
    setFormData({
      // ... outros campos
      photo_url: record.photo_url || null,
    });
  }
}, [record]);

// Update:
.update({
  // ... outros campos
  photo_url: formData.photo_url || null,
})
```

## RecordList (Visualização)

```tsx
<TableHead className="w-[80px]">Foto</TableHead>

// Na célula:
{record.photo_url ? (
  <div className="relative w-12 h-12 rounded overflow-hidden cursor-pointer">
    <Image
      src={record.photo_url}
      alt="Foto do registro"
      fill
      className="object-cover"
      onClick={() => window.open(record.photo_url!, '_blank')}
    />
  </div>
) : (
  <ImageIcon className="h-5 w-5 text-gray-300" />
)}
```

## Configuração no Supabase

### 1. Executar Migration

```bash
# A migration 005_add_photos_support.sql já faz tudo:
# - Adiciona coluna photo_url
# - Cria bucket record-photos
# - Configura RLS policies

# Executar via Supabase CLI ou Dashboard SQL Editor
```

### 2. Verificar Bucket

No Supabase Dashboard:
1. Storage → Buckets
2. Verificar se `record-photos` existe
3. Verificar se é público
4. Testar upload manual

### 3. Verificar Policies

```sql
-- Listar policies do bucket
SELECT * FROM storage.policies WHERE bucket_id = 'record-photos';

-- Deve ter 4 policies:
-- 1. SELECT (anyone)
-- 2. INSERT (authenticated)
-- 3. UPDATE (authenticated)
-- 4. DELETE (authenticated)
```

## Troubleshooting

### Erro: "Bucket não encontrado"

**Solução:**
```sql
-- Criar bucket manualmente
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-photos', 'record-photos', true);
```

### Erro: "Permissão negada ao fazer upload"

**Solução:**
```sql
-- Verificar policy de INSERT
-- Deve permitir authenticated users
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'record-photos' 
  AND auth.role() = 'authenticated'
);
```

### Imagem não carrega na lista

**Causas comuns:**
1. URL inválida (verificar `photo_url` no banco)
2. Bucket não público
3. Arquivo foi deletado do storage
4. CORS (improvável com Supabase)

**Debug:**
```typescript
// Testar URL diretamente
console.log('Photo URL:', record.photo_url);
// Abrir URL no navegador
```

### Erro de tamanho de arquivo

**Validação client-side:**
```typescript
if (file.size > 5 * 1024 * 1024) {
  alert('A imagem deve ter no máximo 5MB');
  return;
}
```

## Melhorias Futuras

- [ ] Compressão de imagens antes do upload
- [ ] Suporte a múltiplas fotos por registro
- [ ] Galeria de fotos lightbox
- [ ] Edição básica de imagens (crop, rotate)
- [ ] Lazy loading nas miniaturas
- [ ] Cache de imagens (PWA)
- [ ] Sincronização de uploads pendentes offline

## Performance

### Otimizações Implementadas

- ✅ `next/image` com otimização automática
- ✅ `unoptimized` para URLs externas (Supabase)
- ✅ Miniaturas pequenas (48x48px)
- ✅ Preview com FileReader (sem upload até salvar)
- ✅ Validação client-side (evita uploads inválidos)

### Considerações

- Imagens são servidas do Supabase CDN
- URLs públicas são cacheáveis
- First load pode ser lento (rede)
- Consider usar thumbnails no futuro

## Segurança

### Validações

- ✅ Tipo de arquivo (client-side)
- ✅ Tamanho de arquivo (client-side)
- ✅ RLS policies (server-side)
- ✅ Apenas authenticated users podem upload
- ⚠️ Sem validação de conteúdo (malware, etc)

### Recomendações

- Implementar scan de malware (futuro)
- Rate limiting no upload (via Supabase Edge Functions)
- Watermark em fotos sensíveis
- Backups regulares do bucket

## Exemplos de Uso

### Caso 1: Registro de Febre com Foto do Termômetro

```
1. Pai/mãe adiciona sintoma "Febre"
2. Tira foto do termômetro mostrando 38.5°C
3. Faz upload da foto
4. Salva registro
5. Pode ver foto depois na lista ✅
```

### Caso 2: Medicação com Foto da Embalagem

```
1. Pai/mãe adiciona medicação "Dipirona"
2. Tira foto da caixa/bula
3. Upload da foto
4. Dose, horário, observações
5. Salva com foto anexa ✅
```

### Caso 3: Editar para Adicionar Foto

```
1. Registro já existe sem foto
2. Clica em "Editar"
3. Adiciona foto via upload
4. Salva alterações
5. Foto agora aparece na lista ✅
```

## Estatísticas

- **Espaço usado**: Depende do uso
- **Limite Supabase**: 1GB grátis (pode expandir)
- **URLs**: Permanentes (mesmo após deletar registro)
- **Cleanup**: Manual (deletar fotos órfãs)

---

**Documentação atualizada em**: 07/11/2025
**Versão**: 1.8.0
