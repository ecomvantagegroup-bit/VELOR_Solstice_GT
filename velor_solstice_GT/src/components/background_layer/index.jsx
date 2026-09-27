// src/components/background_layer/index.jsx
//
// One <canvas>, driven by the shared cinematicState. As chapterIndex
// changes, this swaps to that chapter's image sequence + audio track;
// within a chapter, it just calls setProgress() on every scroll tick —
// the same two calls debug.html makes, just re-triggered per chapter.

import { loadImageSequence } from '../../utils/imageSequence.js'
import { createAudioManager } from '../../utils/audioControl.js'
import { cinematicState, CHAPTER_ORDER, attachCinematicScroll } from '../../state/cinematicScroll.js'
import './index.css'

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart']

export default {
  name: 'BackgroundLayer',

  data() {
    return {
      activeChapter: null,
      loadFailed: false,
    }
  },

  computed: {
    sharedChapterIndex() {
      return cinematicState.chapterIndex
    },
    sharedChapterProgress() {
      return cinematicState.chapterProgress
    },
  },

  watch: {
    sharedChapterIndex(newIndex) {
      const name = CHAPTER_ORDER[newIndex]
      if (name !== this.activeChapter) {
        this.loadChapter(name)
      }
    },
    sharedChapterProgress() {
      this.renderFrame()
    },
  },

  async mounted() {
    this.sequence = null
    this.audio = null
    this.switching = false
    this.started = false

    attachCinematicScroll('scroll-area')

    this.activeChapter = CHAPTER_ORDER[cinematicState.chapterIndex]
    await this.loadChapter(this.activeChapter)
    this.renderFrame()

    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, this.tryUnlock, { passive: true }))
  },

  beforeUnmount() {
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, this.tryUnlock))
  },

  methods: {
    // ASSUMPTION: loadImageSequence() and audio.setSection() can both be
    // called again, on the same canvas / same audio manager, to switch to
    // a different chapter mid-session. debug.html only ever exercised a
    // single call for a single section — verify this holds before
    // shipping, especially for how quickly a new sequence's frames are
    // ready when the visitor is scrolling fast across a chapter boundary.
    async loadChapter(name) {
      if (!name) {
        console.error('[BackgroundLayer] loadChapter() called with no chapter name.');
        return;
      }

      this.switching = true

      try {
        this.sequence = await loadImageSequence(this.$refs.canvas, name)
      } catch (error) {
        console.error(`[BackgroundLayer] Failed to load image sequence for "${name}":`, error);
        this.loadFailed = true;
        this.switching = false;
        return;
      }

      this.loadFailed = false;

      try {
        if (!this.audio) this.audio = await createAudioManager()
        await this.audio.setSection(name, cinematicState.chapterProgress)
      } catch (error) {
        console.warn(`[BackgroundLayer] audio unavailable for "${name}":`, error?.message || error)
      }

      this.activeChapter = name
      cinematicState.ready = true
      this.switching = false
    },

    renderFrame() {
      if (!this.sequence || this.switching) return

      this.sequence.setProgress(cinematicState.chapterProgress)

      if (this.audio && this.started) {
        this.audio.setProgress(cinematicState.chapterProgress, cinematicState.direction).catch(() => { })
      }
    },

    async tryUnlock() {
      if (!this.audio || this.started) return
      try {
        await this.audio.resume()
        this.started = true
        UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, this.tryUnlock))
      } catch {
        // Will retry on the next gesture.
      }
    },
  },

  render() {
    return (
      <>
        <canvas
          ref="canvas"
          class="background-layer absolute inset-0 h-full w-full"
          style={{ opacity: cinematicState.ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
        <div class="background-vignette" />
        <div class="background-grain" />
        {this.loadFailed && (
          <div class="background-error absolute inset-0 flex items-center justify-center text-white/50 text-sm">
            Couldn't load "{this.activeChapter}" — check the console for the failed image path.
          </div>
        )}
      </>
    )
  },
}
