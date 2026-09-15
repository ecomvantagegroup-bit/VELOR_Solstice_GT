# VELOR Solstice GT

### Continuous Sequence Automotive Experience

**VELOR Solstice GT** is a cinematic automotive landing page built around an unbroken **1,200-frame interactive camera sequence**.

Instead of relying on traditional hero animations, video sections, or disconnected transitions, VELOR gives the visitor direct control over the camera. As the user scrolls, the website advances through the cinematic sequence frame-by-frame.

> **Scroll → Camera → Frame → Story**

The result is an immersive digital experience designed to feel less like a conventional website and more like an **automotive film controlled by the visitor**.

---

## ✦ Experience

VELOR is built around one core interaction:

**The user controls the camera.**

```text
USER SCROLL
     ↓
SCROLL PROGRESS
     ↓
FRAME INDEX
     ↓
HTML CANVAS
     ↓
CURRENT CINEMATIC FRAME
```

The entire page is driven by a single continuous sequence containing approximately **1,200 optimized WebP frames**.

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

There are no visual breaks between the major cinematic moments. The camera path remains continuous from the opening frame through the final reveal.

---

## 🎬 Core Features

* 1,200-frame cinematic image sequence
* Scroll-controlled camera movement
* Frame-accurate scrubbing
* GSAP ScrollTrigger integration
* HTML Canvas-based rendering
* Dynamic cinematic pinning
* 8 narrative chapters
* Transparent content overlays
* Image preloading and frame caching
* Responsive canvas scaling
* Mobile-optimized layouts
* Reduced-motion support
* Configuration-driven sequence architecture
* GPU-friendly compositing
* Minimal DOM animation

---

# 🧭 Narrative Structure

The cinematic journey is divided into **8 narrative chapters**.

| Chapter | Title          | Purpose                                            |
| ------- | -------------- | -------------------------------------------------- |
| 01      | Arrival        | Introduce the vehicle and establish atmosphere     |
| 02      | Silhouette     | Reveal the vehicle's overall form                  |
| 03      | Design         | Explore exterior details and design language       |
| 04      | Performance    | Introduce performance characteristics              |
| 05      | Motion         | Transition into dynamic camera movement            |
| 06      | Engineering    | Highlight technical and engineering details        |
| 07      | Solstice Story | Communicate the philosophy behind the vehicle      |
| 08      | Final Reveal   | Conclude the journey with the final product reveal |

Each chapter can define:

* Frame range
* Content overlay
* Pinning behavior
* Camera movement
* Text animation
* Transition metadata
* Narrative position

The sequence configuration is maintained independently from the rendering engine, allowing the narrative structure to evolve without rewriting the core controller.

---

# 🖱️ Scroll-to-Frame Architecture

VELOR intentionally avoids excessive interpolation and easing.

Scroll progress is mapped directly to the active frame.

```text
SCROLL PROGRESS

0%                                      100%
│------------------------------------------│
001                                      1200
```

Conceptually:

```js
frameIndex = scrollProgress * (totalFrames - 1)
```

This creates a direct physical relationship between the user's input and the camera.

```text
Scroll
  ↓
Camera Position
  ↓
Frame
  ↓
Story
```

The objective is to make the visitor feel as though they are **manually operating the camera** rather than triggering an animation.

---

# 📏 Scroll Architecture

The cinematic sequence uses an approximate scroll distance of:

```text
1120vh
```

The scroll position is normalized into a `0 → 1` progress value and then mapped to the complete frame range.

```text
Page Scroll
     ↓
ScrollTrigger
     ↓
Normalized Progress
     ↓
Frame Index
     ↓
Canvas Render
```

This architecture keeps camera movement predictable and frame-accurate throughout the experience.

---

# 📌 Dynamic Cinematic Pinning

VELOR combines two primary cinematic behaviors.

## Locked-Off Moments

The camera can remain fixed while the visitor reads supporting content.

```text
SCROLL
  ↓
CAMERA LOCK
  ↓
CONTENT
  ↓
CAMERA LOCK
```

This gives narrative sections enough time to communicate their message without forcing the camera to constantly move.

## Active Camera Movement

When the story requires movement, the sequence resumes.

```text
SCROLL
  ↓
CAMERA MOVEMENT
  ↓
FRAME PROGRESSION
  ↓
CAMERA MOVEMENT
```

Together, these behaviors create a cinematic rhythm:

```text
Storytelling
     ↓
Camera Movement
     ↓
Storytelling
     ↓
Camera Movement
     ↓
Storytelling
```

---

# 🧩 Content Overlay System

The cinematic canvas acts as the visual foundation while Vue JSX components are rendered above it.

```text
┌─────────────────────────────────┐
│                                 │
│         Content Overlay         │
│                                 │
│      Hero / Story / Specs       │
│                                 │
├─────────────────────────────────┤
│                                 │
│       1,200 Frame Canvas        │
│                                 │
│           VELOR GT              │
│                                 │
└─────────────────────────────────┘
```

The content layer remains independent from the underlying image sequence.

### Primary Content Sections

* Hero
* Vehicle Story
* Design
* Performance
* Engineering
* Specifications
* Solstice Story
* Final CTA

This separation allows the visual sequence and narrative content to evolve independently.

---

# ⚡ Unified Sequence Controller

The core rendering system is located at:

```text
src/components/ImageSequenceController.jsx
```

The controller is responsible for:

* Frame loading
* Image preloading
* Canvas rendering
* Current frame tracking
* Scroll synchronization
* Frame indexing
* ScrollTrigger integration
* Sequence boundaries
* Responsive rendering
* Frame caching

The controller acts as the central engine for the entire cinematic experience.

Rather than distributing sequence logic across individual sections, VELOR maintains a **single source of truth for camera progression and rendering**.

---

# 📦 Preloading Strategy

Frame-perfect scrubbing requires the sequence to be available before it is needed.

VELOR uses image preloading and caching to minimize:

* Frame drops
* Loading gaps
* Image popping
* Stuttering
* Delayed frame changes

The goal is to make the canvas behave like a continuous video surface while retaining the precision and control of individual frames.

### Optimization Pipeline

```text
Optimized WebP
      ↓
Image Preload
      ↓
Frame Cache
      ↓
Canvas Rendering
      ↓
Scroll Synchronization
```

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

The cinematic structure is defined in:

```text
src/config/page-sequence.json
```

The configuration contains the sequence metadata without coupling it to the rendering implementation.

### Example

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

This approach makes it possible to modify:

* Frame boundaries
* Chapter sequencing
* Scroll behavior
* Pinning
* Animation metadata

without modifying the core rendering engine.

---

# 🛠 Tech Stack

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| **Vue.js 3**      | Application framework            |
| **JSX**           | Component templating             |
| **Tailwind CSS**  | Styling and responsive layouts   |
| **GSAP**          | Animation engine                 |
| **ScrollTrigger** | Scroll synchronization           |
| **HTML Canvas**   | High-performance frame rendering |
| **WebP**          | Optimized cinematic assets       |
| **Vite**          | Development and build tooling    |

### JSX Support

The project uses:

```text
@vitejs/plugin-vue-jsx
```

to enable JSX-based Vue components.

---

# 🚀 Performance Strategy

Rendering 1,200 individual frames requires careful resource management.

VELOR is designed around several performance principles:

### Asset Optimization

* WebP image compression
* Optimized frame dimensions
* Efficient asset naming
* Browser caching

### Rendering

* HTML Canvas rendering
* Frame caching
* Minimal DOM manipulation
* Direct frame indexing
* GPU-friendly compositing

### Interaction

* Direct scroll-to-frame mapping
* Controlled ScrollTrigger updates
* Reduced unnecessary animations
* Responsive rendering logic

The goal is to preserve cinematic quality while keeping interaction responsive.

---

# 📱 Responsive Experience

VELOR adapts the cinematic experience across:

* Desktop
* Laptop
* Tablet
* Mobile

The canvas maintains the vehicle's primary visual focal point while the content layer adapts to the available viewport.

### Mobile priorities

* Correct vehicle framing
* Readability
* Touch interaction
* Reduced UI density
* Stable frame rendering
* Appropriate typography scaling

The experience is designed to remain cinematic without simply shrinking the desktop layout.

---

# ♿ Accessibility & Reduced Motion

VELOR respects the user's system-level motion preference through:

```css
prefers-reduced-motion
```

When reduced motion is enabled, the experience can transition to a simplified presentation.

```text
prefers-reduced-motion
        ↓
Reduce / Disable Continuous Camera Motion
        ↓
Simplified Visual Presentation
        ↓
Accessible Content
```

Product information and narrative content remain available without requiring continuous animation.

---

# 🎨 Design Direction

## Visual Identity

**Luxury Performance Automotive**

The visual language combines automotive advertising with editorial design.

### Typography

* Large editorial headlines
* Minimal technical labels
* Strong typographic hierarchy
* Wide spacing
* Compact navigation

### Visual Style

* Dark cinematic backgrounds
* Metallic surfaces
* High-contrast typography
* Subtle accent details
* Minimal interface elements

### UI Philosophy

The interface should remain quiet.

The vehicle and camera movement are the primary visual focus. Unnecessary dashboards, cards, or conventional SaaS-style UI elements are intentionally avoided.

---

# ✨ Signature Interaction

The defining interaction of VELOR is:

> **Scroll to control the camera.**

### Traditional Landing Page

```text
Section
  ↓
Animation
  ↓
Section
  ↓
Animation
```

### VELOR

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
  ↓
Story
```

The website is therefore structured around **one continuous cinematic journey**, rather than a collection of isolated animated sections.

---

# 🎯 What This Project Demonstrates

VELOR showcases advanced frontend techniques including:

* Continuous image-sequence rendering
* 1,200-frame Canvas experiences
* Scroll-to-frame synchronization
* GSAP ScrollTrigger
* Dynamic section pinning
* Cinematic storytelling
* Vue JSX architecture
* Canvas-based rendering
* Image preloading
* Frame caching
* Responsive cinematic layouts
* Performance-conscious animation
* Reduced-motion accessibility

---

# 👑 Ideal Applications

The architecture can be adapted beyond automotive experiences.

Potential applications include:

* Automotive launches
* Luxury vehicles
* Motorcycles
* Luxury products
* Fashion campaigns
* Architecture
* Premium real estate
* Technology launches
* Entertainment campaigns
* Product showcases

The same continuous-sequence architecture can be reused whenever a brand wants to turn scrolling into a cinematic storytelling mechanism.

---

# 🔧 Extensibility

The architecture is intentionally modular.

Additional functionality can be scoped independently, including:

* CMS integration
* Custom backend systems
* Product data management
* Additional pages
* Analytics
* Content management
* Localization
* Advanced interaction systems
* Headless CMS integration
* API integrations

The core cinematic controller can remain unchanged while additional application functionality is layered around it.

---

# 🏁 Experience Goal

VELOR should **not** feel like a website containing an animation.

It should feel like:

> **An automotive film that the visitor controls.**

Every technical decision—from Canvas rendering and frame caching to ScrollTrigger synchronization and dynamic pinning—exists to support one objective:

### Create a seamless cinematic journey from the first scroll to the final reveal.

---

## License

This project is intended as a showcase/demo experience.

Add your preferred license here if the repository is intended for public distribution.

---

## Credits

**VELOR Solstice GT**
Continuous Sequence Automotive Experience

Built as a cinematic frontend experiment exploring scroll-driven storytelling, frame-accurate rendering, and interactive automotive experiences.
