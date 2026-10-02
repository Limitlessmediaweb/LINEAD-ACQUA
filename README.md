# LINEA D’ACQUA — sito-film (concept LIMITLESS)

Sito-esperienza cinematografico per un **cantiere navale immaginario** di yacht a motore su misura (24–40 m, Liguria).
È un concept per il portfolio e i social di LIMITLESS: niente vendita, prezzi o area clienti. Tutti i dati tecnici sono dimostrativi.

> «Tutto inizia da una linea.»

---

## Avvio

```bash
npm install
npm run dev          # sviluppo su http://localhost:3000
npm run build && npm start   # produzione
npm run lint
```

Variabili facoltative (`.env.local`):

| Variabile | Default | Uso |
|---|---|---|
| `NEXT_PUBLIC_LIMITLESS_URL` | `https://www.limitlessmedia.it` | link del credito nel footer e nel menu |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | base per gli URL Open Graph |

**Niente deploy**: il progetto è pronto per Vercel, ma non è stato pubblicato.

### Script di servizio (`scripts/`)

| Script | Cosa fa |
|---|---|
| `process-assets.sh` | da `raw/` (originali Higgsfield, esclusi da git) a `public/media/`: WebP, MP4 H.264 + WebM, poster, fotogrammi del walk tour |
| `build-logo.mjs` | genera `public/brand/logo.svg` e `src/lib/wordmark.ts` dai glifi di Cormorant Garamond Light |
| `shoot.mjs` | screenshot Playwright per capitolo (`--plan "linea:0,0.5,1|giorno:0,1"`) |
| `record.mjs` | registra i 3 video social e li converte in MP4 H.264 yuv420p |
| `axe.mjs` | scansione WCAG 2.1 AA con axe-core su tutte le pagine |
| `lh.sh` | Lighthouse mobile da riga di comando |

---

## Struttura

| Percorso | Contenuto |
|---|---|
| `/` | il film: intro + 8 capitoli + footer |
| `/flotta/[slug]` | `libeccio`, `aurora`, `notturno`: hero video, scheda tecnica animata, walk tour corto, galleria |
| `/cantiere` | storia (dimostrativa), artigianato, timeline verticale |
| `/contatti` | recapiti `[DA COMPLETARE]` |
| `/privacy` | bozza |
| 404 | «Fuori rotta.» con la bussola in ottone che cerca il nord |

```
src/
  app/                 pagine, layout, globals.css (token in @theme), opengraph-image
  components/
    global/            SmoothScroll (Lenis), Grain, Letterbox, Header, Menu, Sound, Cursor, Footer, ChapterIndicator
    home/              Intro, Hero, ChapterLine … ChapterSurface, TrialForm, FilmShell, blueprint.ts
    gl/                GLStage (un solo <Canvas>), scenes (drei View), shaders GLSL, stato condiviso
    model/             parti delle pagine modello e timeline
    ui/                Wordmark, Odometer, Reveal/SplitReveal, BgVideo, Compass
  lib/                 gsap (plugin + CustomEase "lusso"), dati, bus eventi, media query e cancello WebGL
```

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 (token in `@theme`) · GSAP 3.15 con `@gsap/react`
(ScrollTrigger, SplitText, DrawSVG, MorphSVG, Flip, CustomEase: **tutti gratuiti** dalla 3.13, verificato nel pacchetto installato) ·
Lenis (`lerp: 0.07`) · three.js + @react-three/fiber + @react-three/drei (`View`) · `next/font` · `next/image`.

Ease di base: `CustomEase.create("lusso", "0.65, 0, 0.35, 1")`, durate 1,2–2 s.

---

## Asset (Higgsfield)

Generati con Higgsfield MCP: **gpt_image_2_5** (immagini, qualità alta, 2K) e **seedance_2_5** (video image-to-video).
Crediti usati: circa **520** (da 1057 a 537,5).
Coerenza: prima un'immagine di riferimento dello yacht, poi tutte le altre generate **con quella come riferimento**. La baia è generata
una volta a mezzogiorno e poi «ri-illuminata» 4 volte con la stessa inquadratura. Le varianti di colore dello scafo sono l'immagine della
flotta con il solo scafo ridipinto: combaciano al pixel e permettono la transizione che sale dalla linea di galleggiamento.

Stile comune a tutti i prompt: *cinematic film still, anamorphic lens, subtle film grain, desaturated grade, deep blue water, golden light, no text*.

| File (`public/media/`) | Prompt (sintesi) |
|---|---|
| `ref-yacht` | 32 m Italian motor yacht, exact broadside, midnight-navy hull with thin brushed-brass pinstripe, white two-deck superstructure, long dark window bands, low hardtop, golden afternoon |
| `bay-noon` | same yacht at anchor in a secluded Ligurian bay, cliffs with pines, elevated shore vantage, midday |
| `bay-dawn/sunset/blue/night` | *reproduce reference with IDENTICAL framing*, cambia solo l'ora: alba 06:00 con foschia · tramonto 19:30 · ora blu 20:45 · notte 21:40 con tutte le luci accese e luci subacquee |
| `hero-169`, `hero-916` | aerial drone tracking shot at golden sunset, yacht cutting the sea, long white wake |
| `int-salone`, `int-cabina`, `int-poppa` | salone in teak e pelle sabbia con vetrate · cabina armatoriale con finestre di scafo · ponte di poppa con piscina a sfioro al tramonto |
| `macro-teak/pelle/ottone/vetro` | extreme macro: teak oliato con comento · cuciture a sellaio su nabuk · bitta in ottone satinato · vetro fumé con gocce |
| `fleet-libeccio/aurora/notturno` | studio product shot, perfect broadside, pitch-dark void #060B12, rim light, reflection on black floor (24 m compatto · 32 m · 40 m scafo grafite) |
| `hull-perla/grafite/verde` | *reproduce EXACTLY*, cambia solo il colore dello scafo |
| `underwater` | looking up from below the surface at the hull silhouette, god rays, particles |
| `cantiere-capannone`, `cantiere-mani` | scafo in costruzione nel capannone con luce dal portellone · mani che piallano il teak |
| `wood-teak/rovere/noce` | campioni di legno su fondo navy |

| Video (`public/media/video/`) | Prompt (sintesi) |
|---|---|
| `hero-169` (1080p, 8 s) | drone flies slowly parallel to the yacht at sunset, smooth weighty camera, no cuts, loopable |
| `hero-916` (720p, 8 s) | come sopra, verticale |
| `int-salone/cabina/poppa` (1080p, 6 s) | slow gimbal walk-through, camera glides forward at eye level, constant speed |
| `fleet-libeccio/notturno` (720p, 6 s) | aerial tracking del modello in navigazione (mattino tra le scogliere · ora blu con le luci accese) |

Lavorazione (`scripts/process-assets.sh`): hero con **loop senza stacco** (dissolvenza incrociata di 1 s tra coda e testa del clip),
MP4 H.264 `+faststart` + WebM VP9, poster WebP dal primo fotogramma. Walk tour: **90 fotogrammi desktop (1600 px) e 45 mobile (900 px)**
per stanza, WebP, in `public/media/tour/`.

**Audio**: il tool audio di Higgsfield genera solo voce (niente ambienti o effetti), quindi l'ambiente sonoro è **procedurale in Web Audio**:
risacca (rumore marrone con filtro e LFO lenti) più vento (rumore filtrato a banda). È spento di default e diventa ovattato scendendo sott'acqua.
Non pesa nulla da scaricare.

---

## Piani A / B

| Effetto | Scelta |
|---|---|
| Intro con acqua in shader | **A** su desktop (WebGL). Su mobile **B**: acqua e riflesso in CSS/SVG sotto un velo nero (vedi Prestazioni) |
| Shader acqua al cursore (hero) | **A**: texture video in WebGL con 12 increspature che si propagano. Su mobile partono al tocco |
| Disegno tecnico che diventa foto | **A**: DrawSVG su un profilo ricalcato a mano sulla foto e wipe che si apre dalla linea di galleggiamento |
| Walk tour a fotogrammi | **A**: sequenze su `<canvas>` con precaricamento progressivo (0, poi uno ogni 8, poi il resto) e fotogramma più vicino se manca. Il piano B (video in autoplay) non è servito |
| Configuratore | **A**: immagini allineate al pixel, maschera `clip-path` che sale dalla linea di galleggiamento con un filo di luce in ottone |
| Discesa sott'acqua / risalita nel footer | **A**: shader con superficie ondulata, menisco di luce, raggi e caustiche. **B** automatico senza WebGL o con meno movimento: dissolvenza tra due immagini |
| Audio | **B**: procedurale (vedi sopra) |

---

## Decisioni

- **Cartella**: `Desktop/SITI WEB/lineadacqua-site`, accanto agli altri siti.
- **Skill**: `frontend-design` non è disponibile in questa sessione (saltata). Usate `modern-web-guidance` (View Transitions, video ed elaborazione in background), `design:design-critique`, `design:accessibility-review` ed `engineering:code-review`. HawkScan non è configurato (manca il runtime `hawk` e la chiave API) e non è stato eseguito.
- **Un solo `<Canvas>`** fisso *dietro* al contenuto (z 0), con le scene come drei `View` che tracciano il loro elemento DOM. Il render loop va in `frameloop="never"` quando nessuna scena è visibile e il DPR è limitato a 1,5 su mobile. Il canvas viene pulito a ogni fotogramma con una `useFrame` a priorità 0, perché `View` non lo fa.
- **Fallback DOM sempre presente**: ogni scena WebGL ha sotto il suo poster o video DOM, che si nasconde solo quando la scena ha davvero disegnato.
- **Transizioni tra pagine**: `<ViewTransition>` di React con `::view-transition` su nero (`vt-out` 0,7 s, poi `vt-in` con 0,55 s di ritardo): la dissolvenza passa attraverso il nero.
- **Letterbox**: bande fisse del 6% (3,5% su mobile) sulla home. Si stringono e si riaprono a ogni cambio di capitolo. Il capitolo attivo si calcola dal centro dello schermo, pin-spacer compreso.
- **Intro una volta per sessione** (`sessionStorage`), con la classe messa da uno script inline prima del primo paint. C'è il pulsante «Salta l’introduzione»; con meno movimento diventa una dissolvenza.
- **Riflesso del wordmark**: il logo è vettoriale (glifi veri di Cormorant Garamond Light convertiti in tracciati). Il riflesso usa `feTurbulence` animata in SVG e, nell'intro desktop, una texture campionata nello shader che segue la salita delle lettere.
- **Configuratore**: invece di ricolorare lo scafo con un blend su una maschera disegnata a mano, uso 4 foto generate allineate al pixel (differenza verificata con ffmpeg). Il risultato è più fotografico.
- **Capitolo III**: la cornice ha l'aspetto 16:9 su desktop e 4:5 su mobile. Le luci notturne sono posizionate con la stessa matematica di `object-fit: cover`, quindi restano sulle finestre dello yacht a ogni dimensione.
- **Contatore meccanico** (`Odometer`): rulli 0–9 in CSS con ritardo per cifra, annunciati agli screen reader come numero intero.
- **Prova in mare**: validazione propria con messaggi accanto ai campi (`aria-invalid`, `aria-describedby`) e focus sul primo errore. Nessun invio: c'è un `// TODO` in `TrialForm.tsx`.
- **Lag smoothing di GSAP attivo** (500/33) invece di `lagSmoothing(0)`: se il thread si blocca (compilazione shader, decodifica), le timeline rallentano invece di saltare in avanti. Nell'intro faceva la differenza.

### Prestazioni (mobile)

- **Capitoli armati al bisogno** (`useArmed`): pin, ScrollTrigger e SplitText di un capitolo nascono quando è a 2,5 schermi di distanza, sempre in ordine. Per questo ogni nuovo pin nasce sotto quelli esistenti senza spostare nulla. L'indicatore dei capitoli e gli `#ancora` armano tutto prima di scorrere. Su desktop si arma tutto subito.
- **WebGL su mobile al primo tocco** (cancello `useGLGate`): three.js non pesa sul primo caricamento. Su desktop parte subito, perché serve all'intro.
- **Su touch niente Lenis e grana ferma**: Lenis non addolcisce il touch e leggeva la posizione di scroll a ogni fotogramma.
- **Intro mobile come velo nero** sopra l'hero già composto: il titolo è l'LCP e viene dipinto subito. Su mobile il titolo dell'hero e i titoli delle pagine non vengono spezzati da SplitText, per non creare candidati LCP tardivi.
- Prefetch dei link solo al passaggio (niente prefetch automatico di ~10 payload), poster art-directed (uno solo per dispositivo, qualità 60), font ridotti ai pesi usati, video dell'hero scaricato solo a fine intro, immagini del menu solo dopo la prima apertura, lente di Materia solo con puntatore fine.

---

## Verifica

| Controllo | Esito |
|---|---|
| `npm run build` / `npm run lint` / `tsc` | puliti |
| axe-core WCAG 2.1 AA su 6 pagine (`scripts/axe.mjs`) | **0 violazioni** |
| Lighthouse mobile, accessibilità / best practice | **100 / 100** |
| CLS | **0** |
| Peso iniziale (home, mobile, prima dello scroll) | **≈ 0,85 MB** (obiettivo < 2 MB) |
| Lighthouse mobile, Performance (home) | **54–73** a seconda della corsa (misure locali molto variabili); `/cantiere` 69. **Sotto l'obiettivo di 80**, vedi sotto |
| SEO | 63 per scelta: `noindex` perché è un concept |

Screenshot in `screenshots/final/`: inizio, metà e fine di ogni capitolo, a 390×844 e 1440×900.
Video in `screenshots/`: `film-mobile.mp4` (59 s), `walktour-mobile.mp4` (18 s), `film-desktop.mp4` (36 s), tutti H.264 yuv420p.

**Perché la Performance della home non arriva a 80.** Il TBT è passato da 6,9 s a circa 0,4–1,2 s, ma con il throttling simulato di
Lighthouse l'LCP stimato resta a 4–5 s. Con il throttling reale della CPU (4×, `node scripts/marks.mjs`), l'LCP misurato
da Chrome è l'`<h1>` dell'hero a **0,4 s** e nessun task supera i 400 ms. Il resto del costo è l'intro di 8 secondi, animata per scelta di
progetto. Lighthouse la conta tutta prima di dichiarare la pagina «interattiva».

## Cosa migliorare

1. **Performance home ≥ 80**: un'intro mobile ancora più leggera (solo CSS, senza timeline GSAP), il dominio di produzione su CDN (le misure locali su Windows oscillano di ±15 punti) e gli shader dell'acqua precompilati durante l'intro desktop.
2. **Materia su mobile**: i nomi giganti dietro le immagini si vedono poco. Servirebbe una composizione diversa (nome sopra con `mix-blend-mode: difference`).
3. **Video per il Capitolo VII** (girata intorno allo yacht) e un breve **suono d'ambiente registrato** al posto di quello procedurale, se un domani Higgsfield offrirà audio non vocale.
4. **Pausa per i video in loop** (WCAG 2.2.2): oggi si fermano solo con «riduci movimento». Un controllo discreto «Pausa» sull'hero sarebbe corretto.
5. **Menu**: trappola del focus completa (oggi il resto della pagina è `inert` e Esc chiude il menu, ma il Tab può uscire verso l'intestazione).
6. **CMS** per la flotta e la timeline, e invio reale del modulo (API o CRM del cantiere).
