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
    const currentFrame = inject('currentFrame')

    const config = ref(null)
    const activeContent = ref(null)

    let animationContext = null
    let stopWatching = null

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    const loadConfig = async () => {
      const response = await fetch('/sequence.json')

      if (!response.ok) {
        throw new Error('Could not load sequence.json')
      }

      config.value = await response.json()
    }

    const findActiveContent = (frame) => {
      if (!config.value) return null

      return (
        config.value.content.find(
          (item) =>
            frame >= item.startFrame && frame <= item.endFrame
        ) || null
      )
    }

    const animateContent = async () => {
      await nextTick()

      if (animationContext) {
        animationContext.revert()
      }

      const element = document.querySelector('[data-content-wrapper]')
      if (!element) return

      const title = element.querySelector('[data-content-title]')
      const description = element.querySelector('[data-content-description]')

      if (prefersReducedMotion) {
        gsap.set([title, description], { opacity: 1, y: 0 })
        return
      }

      animationContext = gsap.context(() => {
        gsap.fromTo(
          [title, description],
          { opacity: 0, y: 40 },
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
      const nextContent = findActiveContent(currentFrame.value)

      if (nextContent?.id === activeContent.value?.id) return

      activeContent.value = nextContent
      animateContent()
    }

    onMounted(async () => {
      try {
        await loadConfig()
        updateContent()

        stopWatching = watch(currentFrame, () => updateContent())
      } catch (error) {
        console.error(error)
      }
    })

    onBeforeUnmount(() => {
      stopWatching?.()
      animationContext?.revert()
    })

    return {
      activeContent,
      config,
    }
  },

  render() {
    const content = this.activeContent
    const chapters = this.config?.content ?? []
    const activeIndex = chapters.findIndex((c) => c.id === content?.id)

    return (
      <div
        id="main-content"
        class="absolute inset-0 z-10 pointer-events-none bg-transparent"
      >
        {content && (
          <article
            key={content.id}
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
              {/* Only the very first chapter gets the page's single <h1>;
                  later chapters are <h2>s so the document outline stays
                  correct for screen readers and search engines. */}
              {activeIndex === 0 ? (
                <h1
                  data-content-title
                  class="text-white text-4xl md:text-6xl lg:text-7xl font-bold"
                >
                  {content.title}
                </h1>
              ) : (
                <h2
                  data-content-title
                  class="text-white text-4xl md:text-6xl lg:text-7xl font-bold"
                >
                  {content.title}
                </h2>
              )}

              <p
                data-content-description
                class="mt-6 text-white text-lg md:text-xl leading-relaxed"
              >
                {content.description}
              </p>
            </div>
          </article>
        )}

        {/* Chapter progress dots: a lightweight, non-blocking way for
            visitors to see where they are in the story and that there's
            more to scroll through. */}
        {chapters.length > 1 && (
          <nav
            aria-label="Chapter progress"
            class="
              absolute
              bottom-8
              left-1/2
              -translate-x-1/2
              flex
              gap-2
              pointer-events-none
            "
          >
            {chapters.map((chapter, index) => (
              <span
                key={chapter.id}
                aria-hidden="true"
                class={[
                  'h-1.5 rounded-full transition-all duration-300',
                  index === activeIndex
                    ? 'w-8 bg-white'
                    : 'w-1.5 bg-white/40',
                ]}
              />
            ))}
          </nav>
        )}
      </div>
    )
  },
}
