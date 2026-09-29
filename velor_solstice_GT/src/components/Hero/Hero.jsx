import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Hero.css'

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
  name: 'HeroSection',
  setup() {
    const d = data.hero
    const root = ref(null)
    const model = ref(d.modelInput.value)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 85%')
        tl.from('[data-a="meta"]', { y: -14, autoAlpha: 0, stagger: 0.1, duration: 0.6 })
          .from('[data-a="rule"]', { scaleX: 0, transformOrigin: 'left center', duration: 0.9 }, '<')
          .from('[data-a="eyebrow"]', { x: -24, autoAlpha: 0, duration: 0.6 }, '-=0.2')
          .from('[data-a="char"]', { yPercent: 115, duration: 0.75, stagger: 0.035 }, '-=0.3')
          .from('[data-a="cta"]', { y: 28, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, '-=0.4')
          .from('[data-a="star"]', { rotate: -120, scale: 0, duration: 0.9, ease: 'back.out(2)' }, '<')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <section
        ref={root}
        class="rx-section rx-hero relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent px-6 pb-8 pt-28 text-white md:px-[8.5%]"
      >
        <div class="flex items-start justify-between gap-6 text-sm">
          <div class="flex items-start gap-6">
            <span data-a="meta" class="text-white/85">{d.location}</span>
            <span data-a="rule" class="mt-2.5 hidden h-px w-36 bg-[var(--rx-accent)] md:block" />
            <span data-a="meta" class="max-w-[9rem] leading-snug text-white/85">{d.tagline}</span>
          </div>
          <p data-a="meta" class="hidden max-w-[19rem] text-right text-xs leading-relaxed text-white/60 md:block">
            {d.intro}
          </p>
        </div>

        <div class="flex-1" />

        <div class="pb-6">
          <div data-a="eyebrow" class="mb-3 flex items-center gap-3 text-lg text-[var(--rx-accent)]">
            <span class="rx-dash" />{d.eyebrow}
          </div>
          <h1 class="rx-headline text-[clamp(2.75rem,9.2vw,8.75rem)] font-semibold">{words(d.headline)}</h1>

          <div class="mt-10 flex flex-wrap items-center gap-4 md:gap-14">
            {d.ctas.map((c) => (
              <button data-a="cta" type="button" class="rx-btn flex items-center gap-8 rounded-xl px-6 py-3.5 text-xl">
                {c.label}{icons.arrow('h-5 w-5')}
              </button>
            ))}
            <div data-a="cta" class="rx-model-input ml-auto flex w-full max-w-[36rem] items-center justify-between rounded-xl py-1.5 pl-6 pr-1.5 md:w-auto md:flex-1">
              <input
                type="text"
                value={model.value}
                onInput={(e) => (model.value = e.target.value)}
                aria-label="Car model"
                class="w-full bg-transparent text-xl outline-none"
              />
              <button type="button" aria-label="Go" class="rx-tile h-11 w-11 shrink-0">{icons.arrow('h-5 w-5')}</button>
            </div>
          </div>
        </div>

        <span data-a="star" class="rx-star absolute bottom-8 right-5 hidden h-12 w-12 md:block" />
      </section>
    )
  },
})
