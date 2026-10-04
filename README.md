# Studio C Beauty — site

Landing page da Cássia, Lash Designer em Guareí - SP ([@studiocbeauty_](https://www.instagram.com/studiocbeauty_/)).

Site estático (HTML + CSS + JS), sem build. Animações com [GSAP](https://gsap.com/) + ScrollTrigger e rolagem suave com [Lenis](https://lenis.darkroom.engineering/), carregados via CDN.

## Visualizar localmente

Abra o `index.html` no navegador. Para testar como no servidor:

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Site Studio C Beauty"
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
Em ~1 minuto o site fica disponível em `https://<usuario>.github.io/<repositorio>/`.

Depois de publicado, troque `images/aurora-preto.jpg` nas tags `og:image` e no JSON-LD do `index.html` pela URL completa (ex.: `https://<usuario>.github.io/<repositorio>/images/aurora-preto.jpg`) para a prévia aparecer ao compartilhar o link no WhatsApp/Instagram.

## Estrutura

```
index.html           conteúdo e SEO (meta tags, Open Graph, JSON-LD)
assets/css/style.css estilos (tokens de cor/fonte em :root)
assets/js/main.js    interações e animações
assets/favicon.svg
images/              fotos (nomes sem espaço/acento)
```

## Editar conteúdo

- **WhatsApp**: constante `WHATSAPP` em `assets/js/main.js`. Botões usam `class="wa-link"` + `data-msg="mensagem"`.
- **Preços**: seção `#precos` e `.hero__meta` no `index.html` (e `makesOffer` no JSON-LD).
- **Técnicas**: cada `<li class="tech">` tem `data-images` com as fotos por cor de fio (`preto`/`marrom`).
- **Galeria**: blocos `<figure class="shot">`. Sempre informe `width`/`height` reais da imagem.
