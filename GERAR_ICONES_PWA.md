# 🚨 AÇÃO NECESSÁRIA: Gerar Ícones PWA

## ⚠️ O aplicativo PWA precisa de ícones para funcionar corretamente!

### Opção Mais Rápida: RealFaviconGenerator (5 minutos)

1. **Acesse**: https://realfavicongenerator.net/
2. **Upload**: Faça upload do arquivo `public/icon.svg`
3. **Gere**: Clique em "Generate your Favicons and HTML code"
4. **Baixe**: Download o pacote ZIP
5. **Extraia** estes 2 arquivos para a pasta `public/`:
   - `android-chrome-192x192.png` → renomeie para `icon-192.png`
   - `android-chrome-512x512.png` → renomeie para `icon-512.png`

### Verificação

Após adicionar os ícones, você deve ter:

```
public/
├── icon.svg         ✅ (já existe)
├── icon-192.png     ⚠️  PRECISA CRIAR
└── icon-512.png     ⚠️  PRECISA CRIAR
```

### Teste do PWA

1. Build de produção:
   ```bash
   npm run build
   npm start
   ```

2. Abra no navegador (Chrome/Edge):
   - Desktop: Ícone "Instalar" aparece na barra de endereço
   - Mobile: Menu → "Adicionar à tela inicial"

3. Após instalar, o app:
   - ✅ Abre em janela própria (sem barra do navegador)
   - ✅ Aparece no menu de apps do sistema
   - ✅ Tem ícone personalizado
   - ✅ Funciona offline (cache automático)

### Alternativa: ImageMagick (se instalado)

```bash
cd public
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

### Design do Ícone

O arquivo `icon.svg` já contém:
- 👶 Ícone de bebê
- ➕ Cruz médica (vermelho)
- Fundo azul (#3b82f6)

Você pode editar o SVG se quiser personalizar!

---

**📱 Assim que adicionar os ícones, o PWA estará 100% funcional!**
