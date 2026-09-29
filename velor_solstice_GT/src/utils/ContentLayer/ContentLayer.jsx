import { defineComponent, ref, computed, onMounted } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SEQUENCE_JSON_PATH = `${import.meta.env.BASE_URL}config/sequenceConfig.json`

import Hero from '../../components/Hero/Hero.jsx'
import Silhouette from '../../components/Silhouette/Silhouette.jsx'
import Precision from '../../components/Precision/Precision.jsx'
import Specifications from '../../components/Specifications/Specifications.jsx'
import Story from '../../components/Story/Story.jsx'
import FinalReveal from '../../components/FinalReveal/FinalReveal.jsx'

import CanvasSequence from '../sequenceCanvas/sequenceCanvas.jsx'
import './ContentLayer.css'

// Every section name that CAN be pinned to the sequence canvas, and the component that renders
// its text. This is a lookup, not the render order - the order comes from sequenceConfig.json
// (see `pinned` below), so the canvas and this list can never drift out of step with each other.
const COMPONENT_MAP = {
  hero: Hero,
  silhouette: Silhouette,
  precision: Precision,
  specifications: Specifications,
  story: Story,
}

// scroll distance = frames x pixelsPerFrame (falls back to 500vh via CSS if a value is missing)
const scrollFor = (section) => {
  if (!section?.images || !section?.scroll) return undefined
  const frames = section.images.end - section.images.start + 1
  return `${frames * section.scroll.pixelsPerFrame}px`
}

export default defineComponent({
  name: 'ContentLayer',
  setup() {
    const config = ref(null)
    const ready = ref(false)

    onMounted(async () => {
      try {
        const res = await fetch(SEQUENCE_JSON_PATH)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        config.value = await res.json()
      } catch (err) {
        // not fatal: with no config, `pinned` below is simply empty - CanvasSequence does its
        // own fetch of the same file and handles a missing config the same way, so the two
        // never disagree about what to show
        console.error(`Failed to load ${SEQUENCE_JSON_PATH}:`, err)
      } finally {
        ready.value = true
      }
    })

    // The single source of truth for "what's pinned to the canvas": every section listed in
    // sequenceConfig.json, in the order it appears there, each carrying its own scroll height.
    // A section with no matching component (typo, or a name not built yet) is skipped with a
    // warning rather than crashing the page; a component with no config entry (e.g. FinalReveal,
    // Footer) is never pinned at all - those render outside this list, unaffected by the canvas.
    const pinned = computed(() => {
      const sections = config.value?.sections || []
      const list = []
      for (const section of sections) {
        const Comp = COMPONENT_MAP[section.name]
        if (!Comp) {
          console.warn(`[ContentLayer] "${section.name}" is in sequenceConfig.json but has no matching component - skipped.`)
          continue
        }
        list.push({ name: section.name, Comp, scroll: scrollFor(section) })
      }
      return list
    })

    return () => {
      // CanvasSequence renders even while the config is still loading: it's `position: fixed`,
      // does its own fetch of sequenceConfig.json, and waits for each #scroll-area-<name> to
      // exist before attaching to it - see sequenceCanvas.jsx.
      if (!ready.value) {
        return (
          <main id="content-layer" class="cl-root">
            <CanvasSequence />
          </main>
        )
      }

      return (
        <main id="content-layer" class="cl-root">
          <CanvasSequence />

          {pinned.value.map(({ name, Comp, scroll }) => (
            <div
              id={`scroll-area-${name}`}
              key={name}
              data-section={name}
              class="cl-scroll-area"
              style={{ '--cl-scroll': scroll }}
            >
              <div class="cl-sticky">
                <Comp />
              </div>
            </div>
          ))}

          {/* Outside the sequence entirely: no config entry, no canvas frames, no pin. */}
          <div id="scroll-area-final" data-section="finalReveal" class="cl-block">
            <FinalReveal />
          </div>
        </main>
      )
    }
  },
})
