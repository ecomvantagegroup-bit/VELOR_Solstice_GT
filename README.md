# VELOR Solstice GT

### Continuous Sequence Automotive Experience

> A high-performance cinematic landing page built around an unbroken **1,200-frame interactive camera path**, allowing visitors to literally scrub through a cinematic automotive film as they scroll.

---

## 💰 Package

### **VELOR Solstice GT — $3,250 USD**

A premium cinematic landing-page experience focused on advanced scroll interaction, continuous image-sequence rendering, and luxury automotive storytelling.

---

# 🎯 Concept

VELOR Solstice GT is designed around a simple idea:

> **The user controls the camera.**

Instead of using separate hero animations, video sections, or disconnected transitions, the entire visual experience is driven by one continuous camera sequence.

As the visitor scrolls, the website advances through the cinematic footage frame-by-frame.

```text
USER SCROLL
     ↓
SCROLL PROGRESS
     ↓
FRAME INDEX
     ↓
CANVAS
     ↓
CURRENT CINEMATIC FRAME
```

The result is an experience that feels closer to interacting with a digital automotive commercial than navigating a conventional website.

---

# 🎬 Core Experience

## 1,200-Frame Continuous Sequence

The project uses approximately **1,200 optimized WebP frames** representing a single continuous camera journey.

```text
Frame 001
   ↓
Frame 150
   ↓
Frame 300
   ↓
Frame 450
   ↓
Frame 600
   ↓
Frame 750
   ↓
Frame 900
   ↓
Frame 1050
   ↓
Frame 1200
```

There are no visual breaks between the major cinematic moments.

The visitor scrubs through the entire sequence using the page scroll.

---

# 🧭 8 Narrative Chapters

The sequence is organized into **8 cinematic chapters**.

```text
01 — Arrival
02 — Silhouette
03 — Design
04 — Performance
05 — Motion
06 — Engineering
07 — Solstice Story
08 — Final Reveal
```

Each chapter can define:

* Frame range
* Content overlay
* Pinning behavior
* Camera movement
* Text animation
* Transition metadata
* Narrative position

The sequence configuration is maintained separately from the rendering engine.

---

# 🖱️ Linear Frame Scrubbing

GSAP ScrollTrigger maps scroll progress directly to the active frame.

The experience intentionally avoids interpolation or excessive easing.

```text
SCROLL PROGRESS

0%                              100%
│--------------------------------│
001                            1200
```

This creates a direct physical relationship between:

**Scroll → Camera → Frame**

The user feels as though they are manually controlling the camera.

---

# 📏 Scroll Architecture

The cinematic sequence uses a total scroll distance of approximately:

### **1120vh**

The scroll position is converted directly into a frame index.

Conceptually:

```text
frameIndex =
  scrollProgress × (totalFrames - 1)
```

This keeps the camera movement predictable and frame-accurate.

---

# 📌 Dynamic Pinning

VELOR combines two cinematic behaviors.

### Locked-Off Moments

The camera can remain fixed while the user reads the accompanying content.

```text
SCROLL
  ↓
CAMERA LOCK
  ↓
CONTENT
  ↓
CAMERA LOCK
```

### Active Camera Movement

The sequence resumes when the narrative calls for movement.

```text
SCROLL
  ↓
CAMERA MOVEMENT
  ↓
FRAME PROGRESSION
  ↓
CAMERA MOVEMENT
```

This creates a rhythm between:

**Storytelling → Camera Movement → Storytelling → Camera Movement**

---

# 🧩 Transparent Content Overlays

The cinematic canvas remains the visual foundation while Vue JSX components are rendered above it.

```text
┌─────────────────────────────┐
│      Content Overlay        │
│                             │
│   Hero / Story / Specs      │
│                             │
├─────────────────────────────┤
│                             │
│     1,200 Frame Canvas      │
│                             │
│       VELOR GT              │
│                             │
└─────────────────────────────┘
```

### Content Sections

* Hero
* Vehicle Story
* Design
* Performance
* Engineering
* Specifications
* Solstice Story
* Final CTA

The content does not interrupt the underlying cinematic sequence.

---

# ⚡ Unified Sequence Controller

The core rendering system is:

```text
src/components/ImageSequenceController.jsx
```

It manages:

* Frame loading
* Image preloading
* Canvas rendering
* Current frame tracking
* Scroll synchronization
* Frame indexing
* ScrollTrigger integration
* Sequence boundaries
* Responsive rendering

The controller acts as the central engine for the entire cinematic experience.

---

# 📦 Preloading Strategy

Frame-perfect scrubbing requires the sequence to be prepared before it is needed.

The controller uses a preloading strategy to minimize:

* Frame drops
* Loading gaps
* Image popping
* Stuttering
* Delayed frame changes

The objective is to make the canvas feel like a continuous video surface while retaining direct frame-level control.

---

# 📁 Project Structure

```text
velor-solstice-gt/
│
├── public/
│   └── assets/
│       └── car/
│           └── continuous-sequence/
│               ├── frame-0001.webp
│               ├── frame-0002.webp
│               ├── frame-0003.webp
│               ├── ...
│               └── frame-1200.webp
│
├── src/
│   ├── components/
│   │   ├── ImageSequenceController.jsx
│   │   ├── Hero.jsx
│   │   ├── Story.jsx
│   │   ├── Specs.jsx
│   │   └── ...
│   │
│   ├── config/
│   │   └── page-sequence.json
│   │
│   ├── sections/
│   │   ├── Chapter01.jsx
│   │   ├── Chapter02.jsx
│   │   ├── Chapter03.jsx
│   │   ├── Chapter04.jsx
│   │   ├── Chapter05.jsx
│   │   ├── Chapter06.jsx
│   │   ├── Chapter07.jsx
│   │   └── Chapter08.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Sequence Configuration

```text
src/config/page-sequence.json
```

The configuration defines:

* Total frame count
* Chapter boundaries
* Frame ranges
* Scroll metadata
* Pinning behavior
* Animation metadata

Example:

```json
{
  "totalFrames": 1200,
  "totalScrollDistance": "1120vh",
  "chapters": [
    {
      "id": "arrival",
      "startFrame": 0,
      "endFrame": 150
    },
    {
      "id": "silhouette",
      "startFrame": 151,
      "endFrame": 300
    },
    {
      "id": "design",
      "startFrame": 301,
      "endFrame": 450
    }
  ]
}
```

---

# 🛠 Tech Stack

| Technology        | Purpose                    |
| ----------------- | -------------------------- |
| **Vue.js 3**      | Application framework      |
| **JSX**           | Component templating       |
| **Tailwind CSS**  | Styling                    |
| **GSAP**          | Animation engine           |
| **ScrollTrigger** | Scroll synchronization     |
| **HTML Canvas**   | Frame rendering            |
| **WebP**          | Optimized cinematic frames |
| **Vite**          | Build tooling              |

### JSX Support

```text
@vitejs/plugin-vue-jsx
```

---

# 🚀 Performance

The experience is designed around efficient frame rendering.

### Optimization Strategy

* Optimized WebP assets
* Frame preloading
* Canvas rendering
* Frame caching
* Direct scroll mapping
* Minimal DOM animation
* GPU-friendly compositing
* Responsive canvas scaling
* Reduced-motion support

---

# 📱 Responsive Design

The cinematic experience adapts to:

* Desktop
* Laptop
* Tablet
* Mobile

The canvas maintains the vehicle's primary visual focal point while content overlays adapt to smaller screens.

Mobile layouts prioritize:

* Correct vehicle framing
* Readability
* Touch interaction
* Reduced UI density
* Stable frame rendering

---

# ♿ Reduced Motion

Users who prefer reduced motion should receive a simplified experience.

```text
prefers-reduced-motion
        ↓
Reduce / disable continuous camera motion
        ↓
Use simplified visual presentation
        ↓
Maintain content accessibility
```

The narrative and product information remain accessible without requiring continuous animation.

---

# 🎨 Design Direction

## Visual Identity

**Luxury Performance Automotive**

### Typography

* Large editorial headlines
* Minimal technical labels
* Strong hierarchy
* Wide spacing
* Compact navigation

### Visual Style

* Dark cinematic backgrounds
* Metallic surfaces
* High-contrast typography
* Subtle accents
* Minimal interface elements

### UI Philosophy

The UI should stay quiet.

**The camera movement is the primary interface.**

There should be no unnecessary dashboards, cards, or conventional SaaS components competing with the vehicle.

---

# ✨ Signature Interaction

The defining interaction is:

> **Scroll to control the camera.**

Traditional landing page:

```text
Section
   ↓
Animation
   ↓
Section
   ↓
Animation
```

VELOR:

```text
ONE CONTINUOUS CAMERA PATH
───────────────────────────→

Scroll
  ↓
Camera Position
  ↓
Frame
  ↓
Story
  ↓
Camera Position
  ↓
Frame
```

---

# 🎯 What This Demo Showcases

VELOR demonstrates advanced frontend capabilities including:

* Continuous image sequences
* 1,200-frame canvas rendering
* Scroll-to-frame mapping
* GSAP ScrollTrigger
* Dynamic section pinning
* Cinematic storytelling
* Vue JSX architecture
* Canvas-based rendering
* Image preloading
* Performance optimization
* Responsive cinematic layouts

---

# 👑 Ideal Client Industries

VELOR's architecture can be adapted for:

* Automotive
* Luxury vehicles
* Motorcycles
* Luxury products
* Fashion campaigns
* Architecture
* Premium real estate
* Technology launches
* Entertainment
* Product showcases

---

# 💰 Pricing

## VELOR Solstice GT

### **$3,250 USD**

Includes the core cinematic landing-page experience:

* 1,200-frame image sequence
* Continuous scroll-to-frame interaction
* GSAP ScrollTrigger
* Canvas rendering
* 8 narrative chapters
* Dynamic pinning
* Transparent content overlays
* Responsive layout
* Performance-focused implementation

Custom integrations, CMS functionality, advanced backend systems, or additional pages can be scoped separately.

---

# 🏁 Experience Goal

VELOR should not feel like a website containing an animation.

It should feel like:

> **An automotive film that the visitor controls.**

The technical implementation exists to create one thing:

### **A seamless cinematic journey from the first scroll to the final reveal.**
