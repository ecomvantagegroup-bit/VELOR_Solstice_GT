import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './FinalReveal.css'

gsap.registerPlugin(ScrollTrigger)

const svg = 'fill-none stroke-current'
const icons = {
  arrow: (c = 'h-4 w-4') => (
    <svg class={`${c} ${svg}`} viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
}

// splits a string into masked words -> chars so GSAP can stagger them
const words = (text) =>
  text.split(' ').map((w) => (
    <span class="inline-block overflow-hidden pb-[0.06em] pr-[0.28em] align-bottom">
      {w.split('').map((c) => (
        <span data-a="char" class="inline-block">{c}</span>
      ))}
    </span>
  ))

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// one timeline per section, played when the section reaches the viewport (reverses on scroll back)
const sectionTimeline = (el, start = 'top 75%') =>
  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: el, start, toggleActions: 'play none none reverse' },
  })

// count-up for every [data-count] inside `scope`, attached to the timeline so it reverses with it
const bindCounters = (scope, tl, label) => {
  scope.querySelectorAll('[data-count]').forEach((el) => {
    const o = { v: 0 }
    const dec = Number(el.dataset.dec) || 0
    tl.to(o, {
      v: Number(el.dataset.value),
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = o.v.toFixed(dec) },
    }, label)
  })
}

export default defineComponent({
  name: 'FinalRevealSection',
  setup() {
    const d = data.finalReveal
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 80%')
        tl.from('[data-a="grid"]', { autoAlpha: 0, duration: 1 })
          .from('[data-a="char"]', { yPercent: 120, duration: 0.8, stagger: 0.05, ease: 'power4.out' }, '-=0.5')
          .from('[data-a="body"]', { autoAlpha: 0, y: 20, duration: 0.6 }, '-=0.4')
          .from('[data-a="confirm"]', { autoAlpha: 0, x: -40, duration: 0.7 }, '-=0.3')
          .from('[data-a="alt"]', { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.5 }, '-=0.3')
          .from('[data-a="stat"]', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 0.5 }, '-=0.2')
          .addLabel('stats', '<')
        bindCounters(root.value, tl, 'stats')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <section
        ref={root}
        class="rx-section rx-final relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent px-4 pb-4 pt-24 text-white md:px-[3.2%]"
      >
        <div data-a="grid" class="rx-grid-lines pointer-events-none absolute inset-0" />

        <div class="relative flex flex-1 flex-col justify-between rounded-[1.75rem] border border-white/15 p-6 md:p-10">
          <div>
            <h1 class="rx-book text-[clamp(4rem,13vw,11rem)] uppercase">{words(d.headline)}</h1>
            <p data-a="body" class="mt-4 max-w-md text-base leading-relaxed text-white/70">{d.body}</p>
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-4">
            <button data-a="confirm" type="button" class="rx-confirm flex items-center gap-3 rounded-lg px-8 py-5 text-2xl font-medium">
              {d.ctas.primary}{icons.arrow('h-6 w-6')}
            </button>
            {d.ctas.secondary.map((label) => (
              <button data-a="alt" type="button" class="rx-btn flex items-center gap-4 rounded-lg px-5 py-3 text-base">
                {label}{icons.arrow()}
              </button>
            ))}
          </div>
        </div>

        <div class="relative grid grid-cols-2 gap-6 px-4 py-5 text-center sm:grid-cols-4 md:mx-auto md:w-[65%]">
          {d.stats.map((s, i) => (
            <div data-a="stat">
              <div class="text-4xl font-light">
                <span data-count data-value={s.value} data-dec={s.decimals}>{s.value}</span>
                <span class="text-[var(--rx-accent)]">{s.suffix}</span>
              </div>
              <div class="mt-1 text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>

      </section>
    )
  },
})
