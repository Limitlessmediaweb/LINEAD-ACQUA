# PLAN — LINEA D'ACQUA (concept LIMITLESS)

Sito-film per un cantiere di yacht inventato. Il piano va eseguito dall'inizio alla fine, senza deploy.

## Fase 0 — Setup
- [x] Cartella `SITI WEB/lineadacqua-site`, Next.js 16 (App Router) + TS + Tailwind v4
- [x] GSAP 3.15 (tutti i plugin gratuiti inclusi), @gsap/react, Lenis, three, R3F, drei, Playwright
- [x] Skill: `modern-web-guidance` (frontend-design non presente → annotato)
- [ ] git init, `.gitignore` per `raw/`

## Fase 1 — Asset (Higgsfield, gpt_image_2_5 + seedance_2_5)
- [x] Immagine di riferimento dello yacht (scafo blu notte, filetto ottone)
- [ ] Baia × 5 orari (mezzogiorno come base, altre 4 con la base come riferimento)
- [ ] Macro × 4, Flotta × 3 su fondo scuro, Subacquea, Cantiere × 2, Legni × 3
- [ ] Frame iniziali hero (16:9, 9:16) e interni (salone, cabina, poppa)
- [ ] Video: hero 16:9 (1080p) + 9:16, 3 clip interni da 6 s (image-to-video)
- [ ] Varianti colore scafo (Bianco perla, Grafite, Verde inglese) per il configuratore
- [ ] Pipeline ffmpeg: MP4 H.264 + WebM, poster, frame WebP 1600/900 (90/45 per clip), immagini AVIF/WebP
- [ ] Logo SVG con riflesso (`public/brand/logo.svg`), OG image

## Fase 2 — Fondamenta
- [ ] Token `@theme` (abisso, notte, spuma, sabbia, ottone), font Cormorant Garamond + Manrope
- [ ] Provider: Lenis (lerp 0.07) ↔ ScrollTrigger, registrazione plugin, CustomEase "lusso"
- [ ] Globali: grana in canvas, vignettatura, letterbox, cursore, indicatore capitoli, menu, pulsante suono, badge Concept
- [ ] Un unico `<Canvas>` R3F (drei `View`) caricato con dynamic import

## Fase 3 — Il film (home)
- [ ] Intro (linea DrawSVG → acqua → wordmark riflesso → orizzonte), Salta, reduced motion
- [ ] I Orizzonte · II Linea→scafo · III Giorno in mare · IV A bordo · V Materia · VI Flotta · VII Configuratore · VIII Sotto la superficie · Footer

## Fase 4 — Pagine
- [ ] `/flotta/[slug]` × 3, `/cantiere`, `/contatti`, `/privacy`, 404 "Fuori rotta"
- [ ] Transizioni tra pagine (View Transitions, dissolvenza attraverso il nero)

## Fase 5 — Qualità
- [ ] build + lint puliti
- [ ] Playwright: screenshot 390×844 e 1440×900, 3 video social (MP4 yuv420p)
- [ ] Skill finali: design-critique, accessibility-review, code-review → correzioni
- [ ] README (avvio, asset/prompt, piani A/B, decisioni, migliorie)
