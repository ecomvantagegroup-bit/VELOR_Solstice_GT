# VELOR Solstice GT

**Scroll-Driven Cinematic Automotive Experience**

VELOR Solstice GT is a cinematic automotive landing page for the *Prime Car Collection by VELOR* (Dubai, UAE). Each section is driven by its own WebP image sequence rendered on an HTML canvas, paired with a per-section audio track. As visitors scroll, they directly control both the camera and the sound.

```
USER SCROLL → SCROLL PROGRESS → FRAME INDEX → CANVAS → CURRENT FRAME
                      └──────────────→ AUDIO POSITION
```

> **Demo project:** VELOR is a fictional brand and this is a showcase/demo build. All copy, specifications, statistics and links are sample content.

> **Target display:** this project is built strictly for a **1920 × 1080 horizontal (landscape)** resolution.

---

## Core Experience

- **5 pinned sequence sections**, each scrubbed by scroll
- **1,050 total frames** (4 × 200 + 1 × 250), WebP, 4-digit padded filenames
- **Per-section audio** that plays and scrubs forward and backward with scroll
- **Vue JSX overlays** rendered above a fixed canvas, so the vehicle stays visible throughout
- **Animated stat counters** and text reveals inside each section

Frame mapping is linear and direct:

```
frameIndex = scrollProgress * (sectionFrames - 1)
```

---

## Narrative Structure

| # | Section | Frames | Eyebrow | Headline |
|---|---------|--------|---------|----------|
| 01 | Hero | 200 | THE SOLSTICE GT | UNLEASH THE POWER |
| 02 | Silhouette | 200 | FORM FOLLOWS VELOCITY | A Silhouette Cut From Motion Itself |
| 03 | Precision | 200 | INTERIOR EXCELLENCE | Handcrafted Luxury: Where Performance Meets Bespoke Artistry |
| 04 | Specifications | 200 | PERFORMANCE ENGINEERING | Meticulous Precision: Redefining Performance |
| 05 | Story | 250 | The Solstice story | Discover the passion and engineering behind VELOR |

After the Story sequence, the page closes with the **Final Reveal** (Reserve Now) and the **Footer**.

### 01 — Hero
Location tag *Dubai, UAE*, tagline *Prime Car Collection by VELOR*.

> Engineered for the horizon. Built for the moment before it. Every great drive begins with arrival, and the Solstice GT is yours to own.

- CTAs: **Reserve Yours**, **Talk to Us**
- Model input: *Solstice GT*

### 02 — Silhouette
> Shaped in a wind tunnel before it was ever sketched on paper. Every line exists because air demanded it.

- CTAs: **Configure Your Solstice**, **Book a Test Drive**
- **About VELOR** panel with stats (see below) and the note: *Sculpted carbon-fiber aero, ultra-thin LED signature lights and a fixed rear wing.* CTA: **Learn More**
- **Our Featured Models** panel: available in three signature finishes — Crimson Red, Storm Silver and Cobalt Blue

### 03 — Precision (Interior)
Headline: **Handcrafted Luxury: Where Performance Meets Bespoke Artistry.**

A curated cabin of deep black leather with red stitching, hexagon-quilted seats, Alcantara surfaces and carbon-fiber trim, reached through a wide-opening gullwing door.

- Callouts: *Gullwing Access*, *Black Leather & Bespoke Stitching*
- CTAs: **Configure Your Cabin**, **Request a View**

### 04 — Specifications
Headline: **Meticulous Precision: Redefining Performance.**
Frame label: *Forged 21-inch alloy · Michelin Pilot Sport 4 S · 265/30 R21*

| Stat | Value |
|------|-------|
| Piston calipers | 6+ |
| Brake disc diameter | 390 mm |
| Forged wheel weight | 10.2 kg |
| Front wheel size | 20" |

Supporting copy covers forged alloys, multi-piston calipers, reduced unsprung weight and instant driver feedback. CTA: **Learn More**.

### 05 — Story
> Named for the longest light. Three years of design, wind-tunnel testing and track validation went into one goal.

- Wordmark: **VELOR / SOLSTICE GT**
- Subline: *Built to make the ordinary drive feel occasional.*
- Finish swatches: **Storm Silver** `#c4c8ce`, **Crimson Red** `#b3122b`, **Cobalt Blue** `#1d3fd1`
- Featured model card: *Solstice GT — 4.0L Twin-Turbo V8, 630 hp, all-wheel drive*
- CTA: **Learn More**

### Final Reveal
Headline: **RESERVE NOW**

> The Solstice GT is available now at select VELOR showrooms in Crimson Red, Storm Silver and Cobalt Blue, with private test-drive appointments by request.

- Primary CTA: **RESERVE YOUR SOLSTICE**
- Secondary CTAs: **Book a Private Test Drive**, **Find a Showroom**

### Shared Brand Stats

| Value | Label |
|-------|-------|
| 2.5K+ | Cars Delivered |
| 40+ | Showrooms |
| 99% | Owner Satisfaction |
| 50+ | Weekly Test Drives |

---

## Navigation

- Brand: **VELOR**
- Links: Models, Showrooms, Engineering, Contact
- Filter: *Models* · Search placeholder: *Search...*
- CTA: **Reserve Now** · Menu label: *Menu*

---

## Sequence Configuration

Sequence metadata lives in `/config/sequenceConfig.json`. Each section defines its audio, image range and scroll behavior:

```json
{
  "name": "hero",
  "audio": { "path": "/sequence/audios/hero.mp3" },
  "images": {
    "path": "/sequence/Hero/",
    "start": 1,
    "end": 200,
    "extension": ".webp",
    "pad": 4
  },
  "scroll": {
    "pixelsPerFrame": 10,
    "scrub": true,
    "pin": true
  }
}
```

| Section | Image folder | Frames | Audio | Scroll distance |
|---------|--------------|--------|-------|-----------------|
| hero | `/sequence/Hero/` | 1–200 | `/sequence/audios/hero.mp3` | 2,000 px |
| silhouette | `/sequence/silhouette/` | 1–200 | `/sequence/audios/silhouette.mp3` | 2,000 px |
| precision | `/sequence/precision/` | 1–200 | `/sequence/audios/precision.mp3` | 2,000 px |
| specifications | `/sequence/specifications/` | 1–200 | `/sequence/audios/specifications.mp3` | 2,000 px |
| story | `/sequence/story/` | 1–250 | `/sequence/audios/story.mp3` | 2,500 px |

- `pixelsPerFrame: 10` → scroll distance per section = frame count × 10 px (10,500 px across all five sequences)
- `scrub: true` → the sequence and audio follow scroll position, forward and backward
- `pin: true` → each section is pinned while its sequence plays

Frame filenames use 4-digit padding, e.g. `/sequence/Hero/0001.webp` … `/sequence/Hero/0200.webp`.

> **Note:** folder names are case-sensitive on most hosts. The hero folder is `Hero` (capital H) while the others are lowercase, so make sure the folder names on disk match the config exactly.

---

## Content Configuration

All copy (navbar, hero, silhouette, precision, specifications, story, finalReveal, footer) is stored in a single content JSON file, keeping text separate from the components. Stats are defined as `{ value, decimals, suffix, label }` for animated counters.

---

## Architecture

The fixed canvas provides the visual foundation; Vue JSX components render above it as transparent overlays.

```
┌──────────────────────────────────┐
│         CONTENT OVERLAY          │
│  Hero / Silhouette / Precision   │
│  Specifications / Story / Final  │
├──────────────────────────────────┤
│        SEQUENCE CANVAS           │
│  image sequence + scrubbed audio │
└──────────────────────────────────┘
```

### Project Structure

```
velor-solstice-gt/
├── public/
│   └── sequence/
│       ├── Hero/            0001.webp … 0200.webp
│       ├── silhouette/      0001.webp … 0200.webp
│       ├── precision/       0001.webp … 0200.webp
│       ├── specifications/  0001.webp … 0200.webp
│       ├── story/           0001.webp … 0250.webp
│       └── audios/          hero.mp3, silhouette.mp3, precision.mp3,
│                            specifications.mp3, story.mp3
├── config/
│   └── sequenceConfig.json
├── src/
│   ├── App.jsx              Navbar, ContentLayer, Footer
│   ├── components/          Hero, Silhouette, Precision,
│   │                        Specifications, Story, FinalReveal
│   └── utils/
│       ├── ContentLayer/ContentLayer.jsx
│       ├── sequenceCanvas/sequenceCanvas.jsx
│       ├── imageSequence.js
│       └── audioControl.js
├── debug.html               Test harness
├── package.json
├── vite.config.js
└── README.md
```

| File | Role |
|------|------|
| `imageSequence.js` | Frame loading, caching and canvas drawing |
| `audioControl.js` | Audio scrubbing synced to scroll |
| `sequenceCanvas.jsx` | Canvas component and ScrollTrigger integration |
| `ContentLayer.jsx` | Section overlays and text/counter animations |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Vue.js 3 | Application framework |
| JSX (`@vitejs/plugin-vue-jsx`) | Component templating |
| Tailwind CSS | Styling |
| GSAP + ScrollTrigger | Animation and scroll synchronization |
| HTML Canvas | Frame rendering |
| WebP | Optimized frame assets |
| Vite | Build tooling |

---

## Performance

- Optimized WebP frames
- Image preloading and frame caching
- Direct scroll-to-frame mapping
- Minimal DOM animation, GPU-friendly compositing
- Loading screen with progress that preloads all sequences and audio before the hero is shown

---

## Design Direction

**Luxury performance automotive.** Dark cinematic backgrounds, metallic surfaces, high-contrast typography, large editorial headlines, minimal technical labels, subtle accents and a quiet UI. The vehicle and camera movement are the primary interface.

---

## Footer

- **VELOR** — VELOR Motors. *Luxury performance, engineered without compromise.*
- **Explore:** Solstice GT, Design Philosophy, Engineering, Showrooms, Configurator
- **Company:** About VELOR, Careers, Press, Sustainability, Contact
- **Connect:** Instagram, YouTube, Newsletter Signup
- Legal: © 2026 VELOR Motors. All rights reserved. Specifications shown are sample data and subject to change.
- Tagline: *VELOR — The Horizon, Redefined.*

---

## Content Disclaimer

This is a demo project. All vehicle copy, specifications, performance figures, statistics, availability claims, showroom information and CTA destinations are sample content for demonstration purposes only. Buttons and links do not lead to real reservations, test drives or showrooms.

---

## License

Showcase/demo project. Add an appropriate license before public distribution.
