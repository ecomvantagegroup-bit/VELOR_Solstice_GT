import {
  ref,
  onMounted,
  onBeforeUnmount,
  provide,
} from 'vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// How many frames around the current one to keep warm in memory.
const PRELOAD_RADIUS = 25

// How many frames to load up front, before the loading screen is dismissed.
// Keeping this small (rather than all 2500+) means the visitor starts
// scrubbing in seconds instead of waiting for the whole sequence.
const INITIAL_BATCH = 60

export default {
  setup() {
    const canvas = ref(null)

    // Shared with ContentLayer and App so the rest of the UI can react
    // to the same state without duplicating the loading/scroll logic.
    const currentFrame = ref(1)
    const loadProgress = ref(0)
    const isReady = ref(false)
    const hasError = ref(false)

    provide('currentFrame', currentFrame)
    provide('loadProgress', loadProgress)
    provide('isReady', isReady)

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    let config = null
    const imageCache = new Map()
    let resizeObserver = null
    let scrollTween = null

    const getFramePath = (frame) => {
      const frameNumber = String(frame).padStart(4, '0')
      return `${config.imagePath}${frameNumber}.${config.imageExtension}`
    }

    const loadFrame = (frame) => {
      if (
        !config ||
        frame < 1 ||
        frame > config.totalFrames
      ) {
        return Promise.resolve(null)
      }

      if (imageCache.has(frame)) {
        return Promise.resolve(imageCache.get(frame))
      }

      return new Promise((resolve) => {
        const image = new Image()
        image.decoding = 'async'

        image.onload = () => {
          imageCache.set(frame, image)
          resolve(image)
        }

        image.onerror = () => {
          console.warn(`Could not load frame ${frame}`)
          resolve(null)
        }

        image.src = getFramePath(frame)
      })
    }

    const preloadFrames = (frame) => {
      if (!config) return

      const start = Math.max(1, frame - PRELOAD_RADIUS)
      const end = Math.min(config.totalFrames, frame + PRELOAD_RADIUS)

      for (let i = start; i <= end; i++) {
        if (!imageCache.has(i)) {
          loadFrame(i)
        }
      }
    }

    const drawFrame = async (frame) => {
      const image = await loadFrame(frame)
      const canvasEl = canvas.value

      if (!image || !canvasEl) return

      const ctx = canvasEl.getContext('2d')
      const width = window.innerWidth
      const height = window.innerHeight

      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight
      )

      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      const x = (width - drawWidth) / 2
      const y = (height - drawHeight) / 2

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.drawImage(image, x, y, drawWidth, drawHeight)
    }

    const setFrame = (frame) => {
      frame = Math.round(frame)

      if (frame === currentFrame.value) return

      currentFrame.value = frame
      drawFrame(frame)
      preloadFrames(frame)
    }

    const resizeCanvas = () => {
      const canvasEl = canvas.value
      if (!canvasEl) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvasEl.width = window.innerWidth * dpr
      canvasEl.height = window.innerHeight * dpr
      canvasEl.style.width = `${window.innerWidth}px`
      canvasEl.style.height = `${window.innerHeight}px`

      const ctx = canvasEl.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      drawFrame(currentFrame.value)

      // Recalculate pin/scroll distances since the viewport changed size.
      ScrollTrigger.refresh()
    }

    const createScrollAnimation = () => {
      const state = { frame: currentFrame.value }

      scrollTween = gsap.to(state, {
        frame: config.totalFrames,
        ease: 'none',
        snap: { frame: 1 },

        scrollTrigger: {
          trigger: '#scroll-area',
          start: 'top top',
          end: 'bottom bottom',
          // A reduced-motion visitor still controls the camera with their
          // own scroll, but we drop the extra smoothing lag (scrub: 0.5)
          // so nothing moves on its own after the scroll stops.
          scrub: prefersReducedMotion ? true : 0.5,
          invalidateOnRefresh: true,
        },

        onUpdate: () => setFrame(state.frame),
      })
    }

    const preloadInitialBatch = async () => {
      const total = Math.min(INITIAL_BATCH, config.totalFrames)
      let loaded = 0

      await Promise.all(
        Array.from({ length: total }, (_, i) => i + 1).map(
          async (frame) => {
            await loadFrame(frame)
            loaded += 1
            loadProgress.value = Math.round(
              (loaded / total) * 100
            )
          }
        )
      )
    }

    const loadConfig = async () => {
      const response = await fetch('/sequence.json')

      if (!response.ok) {
        throw new Error('Could not load sequence.json')
      }

      config = await response.json()
    }

    onMounted(async () => {
      resizeCanvas()

      resizeObserver = new ResizeObserver(() => resizeCanvas())
      resizeObserver.observe(document.documentElement)

      try {
        await loadConfig()
        await preloadInitialBatch()

        drawFrame(1)
        preloadFrames(1)
        createScrollAnimation()

        isReady.value = true
      } catch (error) {
        console.error(error)
        hasError.value = true
        // Fail open: let visitors read the content even if the sequence
        // can't load, rather than leaving them on a blank screen forever.
        isReady.value = true
      }
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      scrollTween?.scrollTrigger?.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      imageCache.clear()
    })

    return {
      canvas,
      hasError,
    }
  },

  render() {
    return (
      <canvas
        ref="canvas"
        role="img"
        aria-label="Cinematic view of the Velor Solstice GT that advances as you scroll"
        class="
          absolute
          inset-0
          z-0
          block
          h-full
          w-full
          pointer-events-none
        "
        style={
          this.hasError
            ? { display: 'none' }
            : undefined
        }
      />
    )
  },
}
