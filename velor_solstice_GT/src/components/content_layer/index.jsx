// src/components/content_layer/index.jsx
//
// Reads the same `cinematicState` that background_layer reads, and shows
// whichever chapter's content component is currently active. Chapter
// switches crossfade via GSAP inside Vue's <transition>, driven by
// mode="out-in" so the old chapter fully leaves before the new one enters.
//
// Content is gated on cinematicState.ready so text never appears before
// its background frame has actually loaded — without this, hero's copy
// would flash in immediately on mount while the canvas is still blank.

import gsap from 'gsap'
import { cinematicState, CHAPTER_ORDER } from '../../state/cinematicScroll.js'

import HeroChapter from './chapters/hero.jsx'
import SilhouetteChapter from './chapters/silhouette.jsx'
import PrecisionChapter from './chapters/precision.jsx'
import SpecificationsChapter from './chapters/specifications.jsx'
import StoryChapter from './chapters/story.jsx'

const CHAPTERS = {
  hero: HeroChapter,
  silhouette: SilhouetteChapter,
  precision: PrecisionChapter,
  specifications: SpecificationsChapter,
  story: StoryChapter,
}

export default {
  name: 'ContentLayer',

  computed: {
    activeName() {
      return CHAPTER_ORDER[cinematicState.chapterIndex]
    },
    activeComponent() {
      const component = CHAPTERS[this.activeName]

      if (!component) {
        console.error(
          `[ContentLayer] No chapter component registered for "${this.activeName}". ` +
          `Check CHAPTERS in content_layer/index.jsx has an entry for every name in CHAPTER_ORDER.`
        )
      }

      return component || null
    },
  },

  methods: {
    onEnter(el, done) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', onComplete: done }
      )
    },
    onLeave(el, done) {
      gsap.to(el, { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in', onComplete: done })
    },
  },

  render() {
    const Active = cinematicState.ready ? this.activeComponent : null

    return (
      <div class="relative h-full w-full">
        <transition css={false} mode="out-in" onEnter={this.onEnter} onLeave={this.onLeave}>
          {Active ? <Active key={this.activeName} /> : null}
        </transition>
      </div>
    )
  },
}
