# VELOR Solstice GT

### Continuous Sequence Automotive Experience

**VELOR Solstice GT** is a cinematic automotive landing page built around an unbroken **1,200-frame interactive camera sequence**.

Instead of using separate hero animations, video sections, or disconnected transitions, the entire visual experience is driven by one continuous camera journey.

As visitors scroll, they directly control the cinematic camera:

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

The result is an immersive experience designed to feel less like a conventional website and more like **an automotive film that the visitor controls**.

---

## 🎬 Core Experience

### 1,200-Frame Continuous Sequence

The experience uses approximately **1,200 optimized WebP frames** representing a single continuous camera journey.

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

The visitor scrubs through the entire sequence using page scroll, creating a direct relationship between:

> **Scroll → Camera → Frame → Story**

---

# 🧭 Narrative Structure

The landing page is organized into **5 primary content sections**.

While the experience contains **8 cinematic chapters internally**, those chapters are grouped into five larger storytelling sections to keep the page structure focused and editorial.

| Section                            | Cinematic Chapters | Narrative                           |
| ---------------------------------- | ------------------ | ----------------------------------- |
| **01 — Hero**                      | Chapter 01         | Arrival                             |
| **02 — Silhouette / Design**       | Chapters 02–03     | Form, design and visual identity    |
| **03 — Performance / Engineering** | Chapters 04–06     | Performance, motion and engineering |
| **04 — Solstice Story**            | Chapter 07         | The story behind the name           |
| **05 — Final Reveal / CTA**        | Chapter 08         | Final reveal and conversion         |

---

# 01 — Hero

### Chapter 01: Arrival

The opening establishes the Solstice GT as a luxury performance vehicle while introducing the cinematic interaction.

**Eyebrow**

> VELOR MOTORS

**Headline**

> SOLSTICE GT

**Subheadline**

> Engineered for the horizon. Built for the moment before it.

The hero introduces the core philosophy of the vehicle and establishes the visual language for the experience.

The camera begins its journey from the first frame, with the visitor gradually revealing the vehicle through scrolling.

---

# 02 — Silhouette / Design

### Chapters 02–03

The second section transitions from arrival into the vehicle's design language.

**Eyebrow**

> FORM FOLLOWS VELOCITY

**Headline**

> A Silhouette Cut From Motion Itself

The section explores the Solstice GT's aerodynamic profile and exterior details while the camera continues through the sequence.

### Design Highlights

* Sculpted carbon-fiber front splitter
* Frameless side mirrors with integrated turn signals
* Ultra-thin LED signature lighting
* 21-inch forged alloy wheels
* Six signature finishes

### Sample Finishes

* Solstice Copper
* Obsidian Black
* Glacier White
* Storm Grey
* Racing Green
* Midnight Blue

The design content appears as an overlay on top of the cinematic canvas, allowing the vehicle to remain visible throughout the narrative.

---

# 03 — Performance / Engineering

### Chapters 04–06

The third section introduces the technical character of the Solstice GT.

**Eyebrow**

> POWER, REFINED

**Headline**

> Precision at Every RPM

The camera sequence transitions into more dynamic movement while supporting content introduces the vehicle's performance and engineering.

### Sample Specifications

| Specification      |               Value |
| ------------------ | ------------------: |
| Engine             |  4.0L Twin-Turbo V8 |
| Power Output       |              630 hp |
| Torque             |           620 lb-ft |
| 0–60 mph           |         3.1 seconds |
| Top Speed          |             205 mph |
| Transmission       | 8-speed dual-clutch |
| Drivetrain         |     All-wheel drive |
| Curb Weight        |           3,860 lbs |
| Braking (60–0 mph) |               98 ft |
| Fuel Economy       |     18 mpg combined |

> **Note:** All vehicle specifications are sample data intended for demonstration purposes only and must be verified before production launch.

---

# 04 — Solstice Story

### Chapter 07

The fourth section moves away from specifications and into the philosophy behind the vehicle.

**Eyebrow**

> THE STORY BEHIND THE NAME

**Headline**

> Named for the Longest Light

The section explains the inspiration behind the Solstice name and connects the vehicle to the idea of extending the driving experience.

The camera can enter a locked-off cinematic moment here, allowing the visitor to focus on the editorial storytelling while the vehicle remains composed in the background.

### Pull Quote

> “We didn't want to build a faster car. We wanted to build a car that made you want to drive slower, longer.”

— VELOR Design Lead
*Sample attribution*

---

# 05 — Final Reveal / CTA

### Chapter 08

The final section completes the camera journey and delivers the primary conversion moment.

**Eyebrow**

> THE SOLSTICE GT AWAITS

**Headline**

> Your Horizon. Your Terms.

The final reveal brings the cinematic sequence to its conclusion while presenting the visitor with clear next steps.

### Primary Actions

* **Configure Your Solstice GT**
* **Book a Private Test Drive**
* **Find a Showroom**

The final CTA is positioned as the culmination of the cinematic journey rather than as a conventional website section.

---

# 🖱️ Linear Frame Scrubbing

GSAP ScrollTrigger maps scroll progress directly to the active frame.

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

The system intentionally minimizes excessive easing and interpolation.

This preserves the feeling that the visitor is physically controlling the camera.

```text
Scroll
  ↓
Camera Position
  ↓
Frame
  ↓
Story
```

---

# 📏 Scroll Architecture

The cinematic sequence uses an approximate total scroll distance of:

```text
1120vh
```

The scroll position is normalized and mapped across the complete frame range.

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

This provides predictable, frame-accurate camera control across the entire page.

---

# 📌 Dynamic Pinning

VELOR supports both **camera movement** and **locked cinematic moments**.

### Locked-Off Content

```text
SCROLL
  ↓
CAMERA LOCK
  ↓
CONTENT READING
  ↓
CAMERA LOCK
```

### Active Sequence

```text
SCROLL
  ↓
CAMERA MOVEMENT
  ↓
FRAME PROGRESSION
  ↓
CAMERA MOVEMENT
```

This creates a deliberate rhythm:

```text
Story
 ↓
Movement
 ↓
Story
 ↓
Movement
 ↓
Reveal
```

The technique prevents the experience from becoming a constant stream of motion while still maintaining a continuous camera path.

---

# 🧩 Canvas + Content Architecture

The cinematic canvas provides the visual foundation.

Vue JSX components are rendered above the canvas as transparent content overlays.

```text
┌──────────────────────────────────┐
│                                  │
│         CONTENT OVERLAY          │
│                                  │
│     Hero / Design / Specs        │
│                                  │
├──────────────────────────────────┤
│                                  │
│        CINEMATIC CANVAS          │
│                                  │
│          VELOR SOLSTICE          │
│                                  │
└──────────────────────────────────┘
```

The content layer does not interrupt the underlying sequence.

This makes it possible to introduce:

* Editorial copy
* Technical specifications
* Design highlights
* Pull quotes
* CTAs
* Navigation

while maintaining the continuous cinematic experience.

---

# ⚡ Unified Sequence Controller

The central rendering system is:

```text
src/components/ImageSequenceController.jsx
```

The controller manages:

* Frame loading
* Image preloading
* Frame caching
* Canvas rendering
* Current frame tracking
* Scroll synchronization
* Frame indexing
* ScrollTrigger integration
* Sequence boundaries
* Responsive rendering

The controller acts as the single source of truth for the cinematic sequence.

This keeps individual content sections separate from the underlying rendering engine.

---

# ⚙️ Sequence Configuration

Sequence metadata is maintained independently in:

```text
src/config/page-sequence.json
```

The configuration can define:

* Total frame count
* Scroll distance
* Chapter boundaries
* Frame ranges
* Pinning behavior
* Content timing
* Animation metadata
* Narrative position

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
    },
    {
      "id": "performance",
      "startFrame": 451,
      "endFrame": 600
    },
    {
      "id": "motion",
      "startFrame": 601,
      "endFrame": 750
    },
    {
      "id": "engineering",
      "startFrame": 751,
      "endFrame": 900
    },
    {
      "id": "solstice-story",
      "startFrame": 901,
      "endFrame": 1050
    },
    {
      "id": "final-reveal",
      "startFrame": 1051,
      "endFrame": 1199
    }
  ]
}
```

The eight cinematic chapters can therefore remain available at the sequence level while the interface presents them as five larger narrative sections.

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
│   │   ├── Design.jsx
│   │   ├── Performance.jsx
│   │   ├── Story.jsx
│   │   ├── FinalReveal.jsx
│   │   └── ...
│   │
│   ├── config/
│   │   └── page-sequence.json
│   │
│   ├── sections/
│   │   ├── HeroSection.jsx
│   │   ├── DesignSection.jsx
│   │   ├── PerformanceSection.jsx
│   │   ├── SolsticeStorySection.jsx
│   │   └── FinalRevealSection.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

# 🛠 Tech Stack

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| **Vue.js 3**      | Application framework          |
| **JSX**           | Component templating           |
| **Tailwind CSS**  | Styling and responsive layouts |
| **GSAP**          | Animation engine               |
| **ScrollTrigger** | Scroll synchronization         |
| **HTML Canvas**   | Frame rendering                |
| **WebP**          | Optimized cinematic assets     |
| **Vite**          | Build tooling                  |

### JSX Support

The project uses:

```text
@vitejs/plugin-vue-jsx
```

for JSX-based Vue components.

---

# 🚀 Performance

Rendering 1,200 frames requires careful resource management.

VELOR is designed around:

* Optimized WebP assets
* Image preloading
* Frame caching
* Canvas rendering
* Direct scroll-to-frame mapping
* Minimal DOM animation
* GPU-friendly compositing
* Responsive canvas scaling
* Reduced-motion handling

### Rendering Pipeline

```text
WebP Frames
     ↓
Preloading
     ↓
Frame Cache
     ↓
Canvas
     ↓
ScrollTrigger
     ↓
Current Frame
```

The objective is to make the canvas feel like a continuous video surface while retaining frame-level control.

---

# 📱 Responsive Design

The experience is designed for:

* Desktop
* Laptop
* Tablet
* Mobile

The canvas maintains the vehicle's primary visual focal point while content overlays adapt to the viewport.

### Mobile priorities

* Correct vehicle framing
* Readable typography
* Touch-friendly interaction
* Reduced UI density
* Stable frame rendering
* Responsive content positioning

The mobile experience prioritizes cinematic composition rather than simply scaling down the desktop interface.

---

# ♿ Reduced Motion

VELOR respects the user's motion preferences through:

```css
prefers-reduced-motion
```

When reduced motion is enabled, the continuous camera experience can be simplified or disabled while keeping the content and product information accessible.

```text
prefers-reduced-motion
        ↓
Reduce / Disable Continuous Motion
        ↓
Simplified Presentation
        ↓
Accessible Content
```

---

# 🎨 Design Direction

### Visual Identity

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

The vehicle and camera movement are the primary interface.

There should be no unnecessary dashboards, cards, or conventional SaaS components competing with the cinematic experience.

---

# 🧾 Footer Structure

The experience concludes with a minimal luxury-oriented footer.

### VELOR

**VELOR Motors**

Luxury performance, engineered without compromise.

### Explore

* Solstice GT
* Design Philosophy
* Engineering
* Showrooms
* Configurator

### Company

* About VELOR
* Careers
* Press
* Sustainability
* Contact

### Connect

* Instagram
* YouTube
* Newsletter Signup

**Legal**

> © 2026 VELOR Motors. All rights reserved. Specifications shown are sample data for demonstration purposes and subject to change.

**Micro-tagline**

> VELOR — The Horizon, Redefined.

---

# ⚠️ Content Disclaimer

All vehicle copy, specifications, performance figures, pricing, availability, showroom information, and other product details included in this project are **sample/demo content** unless explicitly verified by the client.

Before production launch, all:

* Vehicle specifications
* Performance figures
* Availability claims
* Product details
* Legal statements
* Brand information
* CTA destinations

should be replaced with approved and verified client content.

---

# 🎯 What This Project Demonstrates

VELOR showcases advanced frontend capabilities including:

* Continuous image sequences
* 1,200-frame Canvas rendering
* Scroll-to-frame mapping
* GSAP ScrollTrigger
* Dynamic cinematic pinning
* Cinematic storytelling
* Vue JSX architecture
* Canvas-based rendering
* Image preloading
* Frame caching
* Responsive cinematic layouts
* Performance optimization
* Reduced-motion accessibility

---

# 👑 Ideal Applications

The underlying architecture can be adapted for:

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

The same approach can transform a scroll experience into an interactive cinematic presentation for almost any premium brand.

---

# 🏁 Experience Goal

VELOR should **not** feel like a website containing an animation.

It should feel like:

> ## An automotive film that the visitor controls.

The technical implementation exists to create one thing:

**A seamless cinematic journey from the first scroll to the final reveal.**

---

## License

This project is intended as a showcase/demo experience.

Add the appropriate license if the repository is intended for public distribution.

---

## Credits

**VELOR Solstice GT**
*Continuous Sequence Automotive Experience*

A frontend experiment exploring scroll-driven storytelling, frame-accurate Canvas rendering, cinematic interaction, and premium automotive digital experiences.
