import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Precision.css'

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
  name: 'PrecisionSection',
  setup() {
    const d = data.precision
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 85%')
        tl.from('[data-a="dock"]', { x: -60, autoAlpha: 0, duration: 0.8 })
          .from('[data-a="eyebrow"]', { x: 24, autoAlpha: 0, duration: 0.5 }, '-=0.5')
          .from('[data-a="title"]', { y: 30, autoAlpha: 0, duration: 0.7 }, '-=0.3')
          .from('[data-a="head"]', { y: 40, autoAlpha: 0, duration: 0.8 }, '-=0.5')
          .from('[data-a="body"]', { y: 24, autoAlpha: 0, duration: 0.7 }, '-=0.5')
          .from('[data-a="line"]', { scaleX: 0, duration: 0.8, stagger: 0.25 }, '-=0.3')
          .from('[data-a="dot"]', { scale: 0, duration: 0.4, stagger: 0.25, ease: 'back.out(3)' }, '<')
          .from('[data-a="label"]', { autoAlpha: 0, x: -12, duration: 0.5, stagger: 0.25 }, '<0.2')
          .from('[data-a="cta"]', { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, '-=0.3')
          .from('[data-a="card"]', { y: 60, autoAlpha: 0, duration: 0.8 }, '-=0.6')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    const callout = (children, reverse = false) => (
      <div class={`flex items-center ${reverse ? 'flex-row-reverse' : ''}`}>
        <span data-a="dot" class="rx-callout-dot" />
        <span data-a="line" class={`rx-callout-line w-24 ${reverse ? '!origin-right' : ''}`} />
        <span data-a="label" class="text-lg leading-tight text-white">{children}</span>
      </div>
    )

    return () => (
      <section
        ref={root}
        class="rx-section rx-precision relative flex min-h-screen w-full flex-col overflow-hidden bg-transparent px-4 pb-5 pt-24 text-white md:px-[3%]"
      >
        <div class="grid flex-1 grid-cols-12 gap-6">
          {/* left stage: callout + models dock (imagery is provided by your sequence canvas) */}
          <div class="relative col-span-12 min-h-[26rem] lg:col-span-7">
            <div class="absolute bottom-[20%] left-[34%] hidden lg:block">
              {callout(d.callouts.seat.map((t) => <div>{t}</div>), true)}
            </div>

            <div data-a="dock" class="rx-dock absolute bottom-0 left-0 rounded-tr-3xl p-5 pr-10">
              <div class="mb-1 flex items-center gap-2 text-[11px] text-[var(--rx-accent)]">
                <span class="rx-dash !w-3" />{d.models.eyebrow}
              </div>
              <h2 class="text-4xl font-medium tracking-tight">{d.models.title}</h2>
            </div>
          </div>

          <div class="col-span-12 flex flex-col justify-center gap-5 py-4 lg:col-span-5">
            <div data-a="eyebrow" class="flex items-center gap-2 text-xs text-[var(--rx-accent)]">
              <span class="rx-dash !w-3" />{d.eyebrow}
            </div>
            <div>
              <div data-a="title" class="text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-tight text-[#c4cd7a]">{d.title}</div>
              <h1 data-a="head" class="text-[clamp(2rem,3.6vw,3.25rem)] font-medium leading-[1.05] tracking-tight">{d.headline}</h1>
            </div>
            <p data-a="body" class="max-w-[30rem] text-lg leading-snug text-white/60">{d.body}</p>

            <div class="mt-2 hidden lg:-ml-24 lg:block">{callout(d.callouts.door)}</div>

            <div class="mt-4 flex flex-wrap gap-3">
              <button data-a="cta" type="button" class="rx-btn flex items-center gap-5 rounded-xl py-1.5 pl-5 pr-1.5 text-lg">
                {d.ctas.primary}<span class="rx-tile h-10 w-10">{icons.arrow('h-5 w-5')}</span>
              </button>
              <button data-a="cta" type="button" class="rx-ghost flex items-center gap-8 rounded-xl px-5 py-3 text-lg">
                {d.ctas.secondary}{icons.arrow()}
              </button>
            </div>
          </div>
        </div>

        <div data-a="card" class="rx-glass mt-4 flex h-40 w-full flex-col justify-between rounded-2xl border border-white/15 p-4 lg:absolute lg:bottom-5 lg:left-[6.5%] lg:mt-0 lg:w-[33%]">
          <div class="flex items-center gap-2 text-sm text-white/90">
            <span class="grid h-4 w-4 place-items-center rounded-full bg-white/90 text-black" />{d.models.card.brand}
          </div>
          <div class="text-3xl font-light tracking-tight">{d.models.card.name}</div>
        </div>

        <span class="rx-star absolute bottom-8 right-6 hidden h-12 w-12 md:block" />
      </section>
    )
  },
})
