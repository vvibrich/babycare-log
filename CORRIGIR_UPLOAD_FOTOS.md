# 🔧 Corrigir Erro de Upload de Fotos

## Erro
```
StorageApiError: new row violates row-level security policy
```

## Causa
As políticas RLS do Supabase Storage estão configuradas para exigir autenticação, mas o app usa apenas a chave anônima (anon key).

## Solução

### Opção 1: Via SQL Editor (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://app.supabase.com/project/[seu-projeto]

2. **Abra o SQL Editor**
   - Menu lateral → **SQL Editor**
   - Click em **New query**

3. **Cole o script de correção:**
   ```sql
   -- Drop old policies if they exist
   DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
   DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
   DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

   -- Create new policies that allow operations with anon key
   CREATE POLICY "Anyone can view photos"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'record-photos');

   CREATE POLICY "Anyone can upload photos"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'record-photos');

   CREATE POLICY "Anyone can update photos"
   ON storage.objects FOR UPDATE
   USING (bucket_id = 'record-photos');

   CREATE POLICY "Anyone can delete photos"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'record-photos');
   ```

4. **Execute o script**
   - Click em **Run** (ou pressione Ctrl+Enter)
   - Deve aparecer "Success. No rows returned"

5. **Teste o upload**
   - Tente fazer upload de uma foto novamente
   - Deve funcionar! ✅

### Opção 2: Via Interface do Storage

1. **Acesse Storage**
   - Menu lateral → **Storage**
   - Click no bucket `record-photos`

2. **Configurações → Policies**
   - Vá para aba **Policies**

3. **Delete policies antigas:**
   - "Authenticated users can upload photos"
   - "Users can update their own photos"
   - "Users can delete their own photos"

4. **Crie novas policies:**

   **Policy 1: Anyone can upload photos**
   ```
   Operation: INSERT
   Policy name: Anyone can upload photos
   Target roles: public
   USING expression: (deixar vazio)
   WITH CHECK expression: bucket_id = 'record-photos'
   ```

   **Policy 2: Anyone can view photos**
   ```
   Operation: SELECT
   Policy name: Anyone can view photos
   Target roles: public
   USING expression: bucket_id = 'record-photos'
   WITH CHECK expression: (deixar vazio)
   ```

   **Policy 3: Anyone can update photos**
   ```
   Operation: UPDATE
   Policy name: Anyone can update photos
   Target roles: public
   USING expression: bucket_id = 'record-photos'
   WITH CHECK expression: (deixar vazio)
   ```

   **Policy 4: Anyone can delete photos**
   ```
   Operation: DELETE
   Policy name: Anyone can delete photos
   Target roles: public
   USING expression: bucket_id = 'record-photos'
   WITH CHECK expression: (deixar vazio)
   ```

### Verificação

Após aplicar a correção:

1. **Abra o app**
2. **Tente adicionar um registro com foto**
3. **Upload deve funcionar** ✅

Se ainda der erro:

1. **Verifique se o bucket existe:**
   - Storage → Buckets → `record-photos` deve estar lá

2. **Verifique se é público:**
   - Click no bucket
   - Settings → "Public bucket" deve estar **ON**

3. **Limpe o cache do navegador:**
   - Ctrl+Shift+Delete → Limpar cache

## Explicação

### Por que o erro aconteceu?

A migration original criou policies que exigem:
```sql
auth.role() = 'authenticated'
```

Mas o app usa apenas:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (não autenticado)

### Por que a correção funciona?

As novas policies permitem operações com a chave anônima:
```sql
bucket_id = 'record-photos'  -- Apenas isso
```

### É seguro?

✅ **Sim, para este caso de uso:**
- App é pessoal/familiar
- Não tem dados sensíveis críticos
- Bucket é público mesmo
- Validação de tipo/tamanho no cliente

⚠️ **Para produção com múltiplos usuários:**
- Considere adicionar autenticação (Supabase Auth)
- Policies baseadas em `auth.uid()`
- Rate limiting
- Validação server-side

## Prevenção

Para novos projetos:

1. **Sempre teste uploads logo após criar o bucket**
2. **Configure policies apropriadas desde o início**
3. **Use autenticação se necessário**

## Suporte

Se o erro persistir:

1. Verifique os logs no console do navegador
2. Verifique os logs no Supabase (Logs → API)
3. Teste upload manual no dashboard do Storage

---

**Última atualização:** 07/11/2025
