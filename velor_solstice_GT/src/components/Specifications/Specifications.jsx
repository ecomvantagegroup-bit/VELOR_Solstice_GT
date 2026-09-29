import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Specifications.css'

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
  name: 'SpecificationsSection',
  setup() {
    const d = data.specifications
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 85%')
        tl.from('[data-a="eyebrow"]', { x: -20, autoAlpha: 0, duration: 0.5 })
          .from('[data-a="char"]', { yPercent: 115, duration: 0.7, stagger: 0.012 }, '<0.1')
          .from('[data-a="frame"]', { clipPath: 'inset(0 100% 0 0 round 16px)', duration: 1, ease: 'power4.inOut' }, '-=0.5')
          .from('[data-a="corner"]', { scale: 0, duration: 0.4, stagger: 0.06 }, '-=0.3')
          .from('[data-a="cell"]', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.6 }, '-=0.7')
          .addLabel('stats', '<')
          .from('[data-a="rest"]', { autoAlpha: 0, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.3')
          .from('[data-a="models"]', { autoAlpha: 0, y: 40, stagger: 0.12, duration: 0.7 }, '-=0.4')
        bindCounters(root.value, tl, 'stats')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    const corners = ['left-3 top-3 border-l-2 border-t-2', 'right-3 top-3 border-r-2 border-t-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2']
    const cellBorders = ['border-b border-r', 'border-b', 'border-r', '']

    return () => (
      <section
        ref={root}
        class="rx-section rx-spec relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent px-6 pb-6 pt-24 text-white md:px-[4%]"
      >
        <div>
          <div data-a="eyebrow" class="mb-2 flex items-center gap-3 text-sm text-[var(--rx-accent)]">
            <span class="rx-dash" />{d.eyebrow}
          </div>
          <h1 class="text-[clamp(1.9rem,4.3vw,3.6rem)] font-medium leading-none tracking-tight">{words(d.headline)}</h1>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div data-a="frame" class="rx-frame relative min-h-[18rem] rounded-2xl lg:min-h-[24rem]">
            {corners.map((c) => <span data-a="corner" class={`rx-corner ${c}`} />)}
            <span class="absolute bottom-5 left-6 text-xs text-white/55">{d.frameLabel}</span>
          </div>

          <div class="flex flex-col">
            <div class="rx-stat-grid grid grid-cols-2">
              {d.stats.map((s, i) => (
                <div data-a="cell" class={`rx-stat border-white/20 px-1 py-5 sm:px-6 first:pl-0 ${cellBorders[i]} ${i % 2 === 0 ? 'pl-0' : ''}`}>
                  <div class="text-[clamp(2.75rem,5.2vw,4.5rem)] font-medium leading-none">
                    <span data-count data-value={s.value} data-dec={s.decimals}>{s.value}</span>
                    <span class={s.accent ? 'text-[var(--rx-accent)]' : ''}>{s.suffix}</span>
                  </div>
                  <div class="mt-3 text-base text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
            <div class="mt-5 flex flex-col items-end gap-4 border-t border-white/20 pt-5 sm:flex-row sm:items-end">
              <p data-a="rest" class="max-w-[34rem] text-sm leading-relaxed text-white/60">{d.body}</p>
              <button data-a="rest" type="button" class="rx-btn flex shrink-0 items-center gap-6 rounded-xl py-1.5 pl-5 pr-1.5 text-sm">
                {d.cta}<span class="rx-tile h-9 w-9">{icons.arrow()}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-auto grid grid-cols-1 items-end gap-6 pt-8 lg:grid-cols-2">
          <div data-a="models">
            <div class="mb-2 flex items-center gap-3 text-sm text-[var(--rx-accent)]">
              <span class="rx-dash" />{d.models.eyebrow}
            </div>
            <h2 class="text-4xl font-medium tracking-tight">{d.models.title}</h2>
          </div>
          <div data-a="models" class="rx-card rx-glass flex h-28 flex-col justify-between rounded-t-2xl p-4">
            <span class="flex items-center gap-2 text-sm text-white/85">
              <span class="h-3.5 w-3.5 rounded-full bg-white/85" />{d.models.card.brand}
            </span>
            <span class="text-3xl font-light tracking-tight">{d.models.card.name}</span>
          </div>
        </div>

        <span class="rx-star absolute right-5 top-[58%] hidden h-12 w-12 md:block" />
      </section>
    )
  },
})
