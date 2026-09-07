import {
  ref,
  inject,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from 'vue'

import gsap from 'gsap'

export default {
  setup() {
    const currentFrame =
      inject('currentFrame')

    const config = ref(null)

    const activeContent = ref(null)

    let animationContext = null
    let stopWatching = null

    const loadConfig = async () => {
      const response =
        await fetch('/sequence.json')

      if (!response.ok) {
        throw new Error(
          'Could not load sequence.json'
        )
      }

      config.value =
        await response.json()
    }

    const findActiveContent = (
      frame
    ) => {
      if (!config.value) {
        return null
      }

      return (
        config.value.content.find(
          (item) =>
            frame >= item.startFrame &&
            frame <= item.endFrame
        ) || null
      )
    }

    const animateContent = async () => {
      await nextTick()

      if (animationContext) {
        animationContext.revert()
      }

      const element =
        document.querySelector(
          '[data-content-wrapper]'
        )

      if (!element) return

      const title =
        element.querySelector(
          '[data-content-title]'
        )

      const description =
        element.querySelector(
          '[data-content-description]'
        )

      animationContext =
        gsap.context(() => {
          gsap.fromTo(
            [title, description],

            {
              opacity: 0,
              y: 40,
            },

            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
            }
          )
        }, element)
    }

    const updateContent = () => {
      const nextContent =
        findActiveContent(
          currentFrame.value
        )

      if (
        nextContent?.id ===
        activeContent.value?.id
      ) {
        return
      }

      activeContent.value =
        nextContent

      animateContent()
    }

    onMounted(async () => {
      try {
        await loadConfig()

        updateContent()

        stopWatching = watch(
          currentFrame,
          () => {
            updateContent()
          }
        )
      } catch (error) {
        console.error(error)
      }
    })

    onBeforeUnmount(() => {
      if (stopWatching) {
        stopWatching()
      }

      if (animationContext) {
        animationContext.revert()
      }
    })

    return {
      activeContent,
    }
  },

  render() {
    const content =
      this.activeContent

    return (
      <div
        class="
          fixed
          inset-0
          z-10
          pointer-events-none
          bg-transparent
        "
      >
        {content && (
          <div
            data-content-wrapper
            class="
              absolute
              inset-0
              flex
              items-center
              px-6
              md:px-12
              lg:px-20
              bg-transparent
            "
          >
            <div class="max-w-2xl bg-transparent">
              <h2
                data-content-title
                class="
                  text-white
                  text-4xl
                  md:text-6xl
                  lg:text-7xl
                  font-bold
                "
              >
                {content.title}
              </h2>

              <p
                data-content-description
                class="
                  mt-6
                  text-white
                  text-lg
                  md:text-xl
                  leading-relaxed
                "
              >
                {content.description}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  },
}
