import {
  ref,
  onMounted,
  onBeforeUnmount,
  provide,
} from 'vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  setup() {
    const canvas = ref(null)

    // This is shared with ContentLayer
    const currentFrame = ref(1)

    provide('currentFrame', currentFrame)

    let ctx = null
    let config = null

    const imageCache = new Map()

    let resizeHandler = null

    const PRELOAD_RADIUS = 25

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

      const start = Math.max(
        1,
        frame - PRELOAD_RADIUS
      )

      const end = Math.min(
        config.totalFrames,
        frame + PRELOAD_RADIUS
      )

      for (let i = start; i <= end; i++) {
        if (!imageCache.has(i)) {
          loadFrame(i)
        }
      }
    }

    const drawFrame = async (frame) => {
      const image = await loadFrame(frame)

      if (
        !image ||
        !canvas.value ||
        !ctx
      ) {
        return
      }

      const width = window.innerWidth
      const height = window.innerHeight

      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight
      )

      const drawWidth =
        image.naturalWidth * scale

      const drawHeight =
        image.naturalHeight * scale

      const x =
        (width - drawWidth) / 2

      const y =
        (height - drawHeight) / 2

      ctx.clearRect(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      )

      ctx.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      )
    }

    const setFrame = (frame) => {
      frame = Math.round(frame)

      if (
        frame === currentFrame.value
      ) {
        return
      }

      currentFrame.value = frame

      drawFrame(frame)
      preloadFrames(frame)
    }

    const resizeCanvas = () => {
      if (!canvas.value) return

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      )

      canvas.value.width =
        window.innerWidth * dpr

      canvas.value.height =
        window.innerHeight * dpr

      canvas.value.style.width =
        `${window.innerWidth}px`

      canvas.value.style.height =
        `${window.innerHeight}px`

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      )

      drawFrame(currentFrame.value)
    }

    const createScrollAnimation = () => {
      const state = {
        frame: 1,
      }

      gsap.to(state, {
        frame: config.totalFrames,

        ease: 'none',

        snap: {
          frame: 1,
        },

        scrollTrigger: {
          trigger: '#scroll-area',

          start: 'top top',

          end: 'bottom bottom',

          scrub: 0.5,

          invalidateOnRefresh: true,
        },

        onUpdate: () => {
          setFrame(state.frame)
        },
      })

      ScrollTrigger.refresh()
    }

    const loadConfig = async () => {
      const response =
        await fetch('/sequence.json')

      if (!response.ok) {
        throw new Error(
          'Could not load sequence.json'
        )
      }

      config = await response.json()
    }

    onMounted(async () => {
      ctx =
        canvas.value.getContext('2d')

      resizeHandler = resizeCanvas

      window.addEventListener(
        'resize',
        resizeHandler
      )

      resizeCanvas()

      try {
        await loadConfig()

        await loadFrame(1)

        drawFrame(1)

        preloadFrames(1)

        createScrollAnimation()
      } catch (error) {
        console.error(error)
      }
    })

    onBeforeUnmount(() => {
      window.removeEventListener(
        'resize',
        resizeHandler
      )

      ScrollTrigger.getAll().forEach(
        (trigger) => trigger.kill()
      )

      imageCache.clear()
    })

    return {
      canvas,
    }
  },

  render() {
    return (
      <canvas
        ref="canvas"
        class="
          fixed
          inset-0
          z-0
          block
          h-screen
          w-screen
          pointer-events-none
        "
      />
    )
  },
}
