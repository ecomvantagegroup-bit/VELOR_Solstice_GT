import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SEQUENCE_JSON_PATH = `${import.meta.env.BASE_URL}config/sequenceConfig.json`
import './sequenceCanvas.css'

import { loadImageSequence } from '../imageSequence.js'
import { createAudioManager } from '../audioControl.js'

gsap.registerPlugin(ScrollTrigger)

// Fallback used only for a section with no "frame" entry of its own in sequenceConfig.json.
const DEFAULT_FRAME = { x: '0px', y: '0px', scale: 1 }

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Polls for an element instead of assuming it's already mounted: ContentLayer renders its
// sections one tick after its own sequenceConfig fetch resolves, so this component's own
// ScrollTriggers must wait for `#scroll-area-<name>` to exist before it can attach to it.
const waitForElement = (selector, timeout = 4000) =>
  new Promise((resolve) => {
    const start = performance.now()
    const tick = () => {
      const el = document.querySelector(selector)
      if (el || performance.now() - start > timeout) return resolve(el)
      requestAnimationFrame(tick)
    }
    tick()
  })

// NOTE: these listeners must NOT use { once: true }. If a gesture arrives before audioManager
// has finished loading, the handler below no-ops, and a { once: true } listener would then
// remove itself permanently - meaning no later gesture could ever unlock audio. Instead we
// keep retrying on every gesture until it actually succeeds, then remove them all manually.
const GESTURE_EVENTS = ['pointerdown', 'wheel', 'keydown', 'touchstart']

// How long to wait after the last scroll update before freezing audio at its current position.
// setProgress() never stops a source on its own when there's no movement, so without this an
// active section's audio can keep playing after the visitor stops scrolling.
const SCROLL_STOP_DELAY = 120

// Cover-fit draw, matching the math in loadImageSequence.js: fills the canvas completely,
// centered, cropping the overflow - never letterboxed, never stretched.
function drawCover(ctx, canvas, image) {
  const width = window.innerWidth
  const height = window.innerHeight
  const imageRatio = image.width / image.height
  const canvasRatio = width / height

  let drawWidth, drawHeight
  if (imageRatio > canvasRatio) {
    drawHeight = height
    drawWidth = drawHeight * imageRatio
  } else {
    drawWidth = width
    drawHeight = drawWidth / imageRatio
  }

  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, x, y, drawWidth, drawHeight)
}

function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

export default defineComponent({
  name: 'SequenceCanvas',
  setup() {
    const canvas = ref(null)
    const frame = ref(null)

    let ctx = null
    let audioManager = null
    let triggers = []

    // name -> { images: HTMLImageElement[], frame: {x,y,scale} } - every section decoded up
    // front (see the preload loop in onMounted), so switching sections never has to wait on
    // the network again: it's just swapping which already-loaded array we're drawing from.
    const preloaded = new Map()

    let activeName = null
    let activeImages = null
    let lastProgress = 0
    let firstActivation = true
    let audioUnlocked = false
    let stopTimer = null

    const renderFrame = (progress) => {
      if (!ctx || !activeImages || !activeImages.length) return
      const idx = Math.max(0, Math.min(Math.round(progress * (activeImages.length - 1)), activeImages.length - 1))
      const img = activeImages[idx]
      if (img) drawCover(ctx, canvas.value, img)
    }

    const applyFrame = (frameCfg) => {
      const f = frameCfg || DEFAULT_FRAME
      const vars = { '--cs-x': f.x, '--cs-y': f.y, '--cs-scale': f.scale }
      if (!firstActivation && !reduceMotion()) {
        gsap.to(frame.value, { ...vars, duration: 1.1, ease: 'power3.out', overwrite: true })
      } else {
        gsap.set(frame.value, vars)
      }
    }

    // Instant, synchronous swap - every section's frames are already decoded and sitting in
    // `preloaded`, so there is nothing to await and nothing to fade: the cut is immediate.
    const activateSection = (name, progress) => {
      const data = preloaded.get(name)
      if (!data || activeName === name) return

      activeName = name
      activeImages = data.images
      applyFrame(data.frame)
      renderFrame(progress)

      audioManager?.setSection(name, progress).catch((err) => console.error('[SequenceCanvas] audio section:', err))
      firstActivation = false
    }

    // Drives the frame + audio playhead from the active section's scroll progress.
    const updateProgress = (name, progress, direction) => {
      if (activeName !== name) return
      lastProgress = progress
      renderFrame(progress)

      if (audioUnlocked) {
        audioManager?.setProgress(progress, direction).catch((err) => console.error('[SequenceCanvas] audio:', err))
      }

      // freeze audio shortly after scrolling stops, instead of letting it run on unattended
      clearTimeout(stopTimer)
      stopTimer = setTimeout(() => audioManager?.pause(), SCROLL_STOP_DELAY)
    }

    // Kept retrying (no { once: true }) until resume() actually succeeds - see the note above.
    const tryUnlockAudio = async () => {
      if (!audioManager || audioUnlocked) return
      try {
        await audioManager.resume()
        audioUnlocked = true
        GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, tryUnlockAudio))
      } catch (err) {
        console.error('[SequenceCanvas] audio resume failed:', err)
      }
    }

    const onResize = () => {
      if (!ctx) return
      resizeCanvas(canvas.value, ctx)
      renderFrame(lastProgress)
    }

    // Loads every frame of one section into memory (via a throwaway, never-attached canvas so
    // nothing is drawn to screen while it loads) and keeps just the decoded images.
    const preloadSection = async (section) => {
      const scratch = document.createElement('canvas')
      const seq = await loadImageSequence(scratch, section.name)
      preloaded.set(section.name, { images: seq.images, frame: section.frame || DEFAULT_FRAME })
      seq.destroy() // only needed its own resize listener + tween, both unused from here on
    }

    onMounted(async () => {
      ctx = canvas.value.getContext('2d')
      resizeCanvas(canvas.value, ctx)
      window.addEventListener('resize', onResize)

      // Registered up front, synchronously: a gesture can arrive before createAudioManager()
      // below resolves, and tryUnlockAudio's own guard (audioManager may still be null) covers
      // that without needing this to wait.
      GESTURE_EVENTS.forEach((evt) => window.addEventListener(evt, tryUnlockAudio, { passive: true }))

      audioManager = await createAudioManager()
      tryUnlockAudio() // in case a gesture already happened while audio was still loading

      const res = await fetch(SEQUENCE_JSON_PATH)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const config = await res.json()

      // Every section's audio, decoded up front too - createAudioManager() exposes this itself.
      audioManager.preload(config.sections.map((s) => s.name)).catch((err) =>
        console.error('[SequenceCanvas] audio preload:', err)
      )

      // Sequential, in the order sections appear in the JSON (hero first), so the section a
      // visitor actually lands on is ready as early as possible rather than competing for
      // bandwidth with four sections they haven't scrolled to yet.
      for (const section of config.sections) {
        try {
          await preloadSection(section)
        } catch (err) {
          console.error(`[SequenceCanvas] failed to preload "${section.name}":`, err)
          continue // this section just won't activate; the rest still can
        }

        const el = await waitForElement(`#scroll-area-${section.name}`)
        if (!el) continue // section never mounted (removed from the page, etc.) - skip it

        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => updateProgress(section.name, self.progress, self.direction),
            onToggle: (self) => {
              if (self.isActive) activateSection(section.name, self.progress)
            },
          })
        )
      }
    })

    onBeforeUnmount(() => {
      clearTimeout(stopTimer)
      window.removeEventListener('resize', onResize)
      triggers.forEach((t) => t.kill())
      audioManager?.destroy()
      GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, tryUnlockAudio))
      preloaded.clear()
    })

    return () => (
      <div class="rx-sequence-canvas" aria-hidden="true">
        <div ref={frame} class="rx-frame">
          <canvas ref={canvas} />
        </div>
      </div>
    )
  },
})
