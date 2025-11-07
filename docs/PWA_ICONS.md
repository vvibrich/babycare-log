# 📱 Gerando Ícones PWA

## Opção 1: Usando Ferramentas Online (Recomendado)

1. Acesse: https://realfavicongenerator.net/
2. Faça upload do arquivo `public/icon.svg`
3. Configure as opções (deixe padrão)
4. Clique em "Generate your Favicons and HTML code"
5. Baixe o pacote e extraia:
   - `icon-192.png` → `public/icon-192.png`
   - `icon-512.png` → `public/icon-512.png`

## Opção 2: Usando ImageMagick (Linux/Mac)

```bash
# Instalar ImageMagick
sudo apt install imagemagick  # Ubuntu/Debian
brew install imagemagick      # macOS

# Gerar ícones
cd public
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

## Opção 3: Criar Manualmente

Use qualquer editor gráfico:
- **Figma**: Exporte em 192x192 e 512x512
- **Canva**: Crie e baixe nos tamanhos
- **Photoshop/GIMP**: Redimensione e exporte

## Tamanhos Necessários

- **icon-192.png**: 192x192 pixels (obrigatório)
- **icon-512.png**: 512x512 pixels (obrigatório)

## Design Recomendado

✅ **BOM:**
- Ícone simples e reconhecível
- Cores contrastantes
- Ícone de bebê + cruz médica
- Fundo sólido

❌ **EVITAR:**
- Muito texto
- Detalhes pequenos
- Cores muito claras

## Teste

Após adicionar os ícones:

1. Build de produção: `npm run build`
2. Inicie o servidor: `npm start`
3. Abra no celular/navegador
4. Menu → "Instalar aplicativo"
5. Veja o ícone no home screen

## Arquivo SVG Base

O arquivo `public/icon.svg` já contém um design base com:
- 👶 Bebê estilizado
- ➕ Cruz médica vermelha
- 🔵 Fundo azul (#3b82f6)

Você pode editá-lo conforme necessário!
