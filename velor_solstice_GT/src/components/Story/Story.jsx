import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Story.css'

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
  name: 'StorySection',
  setup() {
    const d = data.story
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 85%')
        tl.from('[data-a="meta"]', { autoAlpha: 0, y: -10, stagger: 0.08, duration: 0.5 })
          .from('[data-a="char"]', { yPercent: 115, duration: 0.6, stagger: 0.008 }, '-=0.2')
          .from('[data-a="wordmark"]', { autoAlpha: 0, letterSpacing: '1em', duration: 1.1 }, '-=0.5')
          .from('[data-a="finish"]', { autoAlpha: 0, y: 24, stagger: 0.15, duration: 0.6 }, '-=0.6')
          .from('[data-a="sub"]', { autoAlpha: 0, y: 20, duration: 0.6 }, '-=0.2')
          .from('[data-a="stat"]', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 0.5 }, '-=0.3')
          .addLabel('stats', '<')
          .from('[data-a="cta"]', { autoAlpha: 0, scale: 0.9, duration: 0.5 }, '-=0.3')
          .from('[data-a="model"]', { autoAlpha: 0, y: 40, stagger: 0.15, duration: 0.7 }, '-=0.3')
        bindCounters(root.value, tl, 'stats')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <section
        ref={root}
        class="rx-section rx-story relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent px-6 pb-6 pt-24 text-white md:px-[6%]"
      >
        <div class="flex items-start justify-between gap-6 text-xs">
          <div class="flex items-start gap-8">
            <span data-a="meta" class="text-white/85">{d.location}</span>
            <span class="mt-2 hidden h-px w-32 bg-white/45 md:block" />
            <span data-a="meta" class="max-w-[8rem] text-white/85">{d.tagline}</span>
          </div>
          <p data-a="meta" class="hidden max-w-[16rem] text-right leading-relaxed text-white/60 md:block">{d.intro}</p>
        </div>

        <h1 class="mx-auto mt-6 max-w-[40rem] text-center text-[clamp(1.5rem,2.6vw,2.25rem)] font-normal leading-tight">
          {words(d.headline)}
        </h1>

        <div data-a="wordmark" class="rx-wordmark mt-3 text-center text-3xl font-light text-white/70">
          {d.wordmark.top}
          <div class="text-lg tracking-[0.3em]">{d.wordmark.bottom}</div>
        </div>

        <div class="grid flex-1 grid-cols-3 items-end gap-4 pb-4 pt-16 text-center text-sm text-white/75">
          {d.finishes.map((f) => (
            <div data-a="finish" class="flex items-center justify-center gap-2">
              <span class="rx-swatch" style={{ background: f.swatch }} />{f.name}
            </div>
          ))}
        </div>

        <div class="text-center">
          <p data-a="sub" class="text-xl text-white">{d.subline}</p>
          <div class="mx-auto mt-2 flex max-w-xl flex-wrap justify-center gap-x-10 gap-y-3">
            {d.stats.map((s) => (
              <div data-a="stat">
                <div class="rx-stat-num text-4xl text-[var(--rx-accent)]">
                  <span data-count data-value={s.value} data-dec={s.decimals}>{s.value}</span>{s.suffix}
                </div>
                <div class="text-[11px] text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
          <button data-a="cta" type="button" class="rx-btn mt-5 inline-flex items-center gap-8 rounded-lg py-1.5 pl-4 pr-1.5 text-xs">
            {d.cta}<span class="rx-tile h-7 w-7">{icons.arrow('h-3.5 w-3.5')}</span>
          </button>
        </div>

        <div class="mt-8 flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
          <div data-a="model" class="self-start">
            <div class="mb-2 flex items-center gap-3 text-xs text-[var(--rx-accent)]">
              <span class="rx-dash" />{d.models.eyebrow}
            </div>
            <h2 class="text-5xl font-medium italic tracking-tight">{d.models.title}</h2>
          </div>

          <div data-a="model" class="rx-feature-card flex w-full max-w-[29rem] items-center gap-5 rounded-2xl p-3 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2">
            <div class="rx-glass grid h-24 w-32 shrink-0 place-items-center rounded-xl text-4xl font-light text-white/60">V</div>
            <div>
              <div class="text-sm font-medium text-[var(--rx-accent)]">{d.models.card.label}</div>
              <div class="mt-1 flex items-center gap-2 text-lg"><span class="h-3.5 w-3.5 rounded-full bg-white/85" />{d.models.card.brand}</div>
              <div class="mt-1 font-medium">{d.models.card.name}</div>
              <div class="text-sm leading-snug text-white/75">{d.models.card.detail}</div>
            </div>
          </div>
        </div>

        <span class="rx-star absolute bottom-6 right-5 hidden h-12 w-12 md:block" />
      </section>
    )
  },
})
