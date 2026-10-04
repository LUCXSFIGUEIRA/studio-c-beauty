# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing page for **Studio C Beauty** — Cássia, Lash Designer in Guareí - SP (Instagram: @studiocbeauty_). All user-facing copy is Brazilian Portuguese. Hosted on GitHub Pages (see README.md for deploy steps).

No build step, package manager, linter or tests. Preview by opening `index.html` or `python -m http.server 8000`.

## Business facts (from the client — don't change without asking)

- Prices are fixed: **R$ 120 application** (any technique), **R$ 70 maintenance**. They appear in the hero meta, `#precos`, and JSON-LD `makesOffer`.
- Address: Rua São João, n° 1021, Centro, Guareí - SP, 18250-013. WhatsApp 5515997333065.
- Techniques: Brasileiro, Egípcio, Fox, Luxo, Ruby, Aurora. Ruby/Aurora descriptions and FAQ durations are generic copy pending client confirmation. Never invent testimonials.

## Architecture

- `index.html` — markup, SEO (Open Graph, BeautySalon JSON-LD), inline SVG `<symbol>` sprite (`#lash`, `#wa`, `#arrow`…) reused via `<use>`. The loader's lash SVG is inline (not `<use>`) because GSAP animates its paths' `stroke-dashoffset`.
- `assets/css/style.css` — design tokens on `:root`, BEM-ish class names, responsive breakpoints at 1100 / 900 / 640px.
- `assets/js/main.js` — single IIFE. **Layering is important:** everything functional (WhatsApp links, menu, technique switcher, FAQ, lightbox, gallery progress) runs first without GSAP; the function returns early if GSAP is missing or `prefers-reduced-motion` is set, and only then sets up animations. Keep new essential features above that early return.
- Libraries via jsDelivr CDN: `gsap@3.13.0` (+ScrollTrigger), `lenis@1.3.11`. Lenis drives ScrollTrigger via `gsap.ticker`; use the `lockScroll()` / `scrollToEl()` helpers instead of touching body overflow or `scrollIntoView` directly.
- HTML state classes on `<html>`: `js`/`no-js`, `reduced-motion` (set inline in `<head>`), `no-gsap`, `menu-open`, `has-cursor`, `is-hscroll` (desktop pinned horizontal gallery, added inside `gsap.matchMedia`).

### Animation hooks (data attributes)

- `data-split` — heading split into masked words and revealed on scroll (keeps inner `<em>`).
- `data-fade` — fade-up via `ScrollTrigger.batch`.
- `data-reveal-img` — clip-path reveal of the wrapper (+ scale of a direct child `img`).
- `data-parallax="N"` — image drifts `yPercent: -N`; the CSS must give that img extra height (e.g. 118%) so no gap shows.
- `data-count` — number counter. `data-magnetic` — magnetic hover (fine pointers). `data-cursor` — custom cursor shows "Ver".

Avoid GSAP-animating `transform` on elements that also have a CSS `transform` transition (it fights the tween) — see how `.hero__badge` disables its transition during the intro.

### Content wiring

- `.wa-link` + `data-msg` → JS rewrites `href` to `wa.me` with the prefilled message. Don't hardcode wa.me URLs.
- Technique switcher: each `.tech` has `data-name` and `data-images` JSON (`{"preto": ..., "marrom": ...}`); the shade toggle hides itself when there's no `marrom`.
- Images in `images/` use kebab-case ASCII names (GitHub Pages is case-sensitive and accents/spaces break URLs). Always set real `width`/`height` attributes; the base CSS `img { height: auto }` prevents the attribute from forcing pixel height.

## Visual testing

Edge headless `--virtual-time-budget` barely advances `requestAnimationFrame`, so GSAP timelines (loader) appear stuck — not a site bug. Use Playwright (Python) with `channel="msedge"` and real waits/wheel scrolling to screenshot.
