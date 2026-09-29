import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Silhouette.css'

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
  name: 'SilhouetteSection',
  setup() {
    const d = data.silhouette
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (prefersReduced()) return
      ctx = gsap.context(() => {
        const tl = sectionTimeline(root.value, 'top 85%')
        tl.from('[data-a="panel"]', { clipPath: 'inset(0 0 100% 0 round 32px)', duration: 1.1, ease: 'power4.inOut' })
          .from('[data-a="meta"]', { autoAlpha: 0, y: -10, stagger: 0.08, duration: 0.5 }, '-=0.5')
          .from('[data-a="eyebrow"]', { x: -20, autoAlpha: 0, duration: 0.5 }, '-=0.2')
          .from('[data-a="char"]', { yPercent: 115, duration: 0.7, stagger: 0.02 }, '<')
          .from('[data-a="bar"]', { autoAlpha: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.3')
          .from('[data-a="about"]', { autoAlpha: 0, y: 30, stagger: 0.1, duration: 0.6 }, '-=0.2')
          .from('[data-a="model"]', { autoAlpha: 0, x: 40, stagger: 0.12, duration: 0.7 }, '<')
          .addLabel('stats', '-=0.6')
        bindCounters(root.value, tl, 'stats')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <section
        ref={root}
        class="rx-section rx-sil relative flex min-h-screen w-full flex-col gap-10 overflow-hidden bg-transparent px-4 pb-6 pt-24 text-white md:px-[8%] xl:px-[14%]"
      >
        <div data-a="panel" class="rx-panel relative flex min-h-[64vh] flex-col rounded-[2rem] px-6 pb-10 pt-6 md:px-8">
          <div class="flex items-start justify-between gap-6 text-xs">
            <div class="flex items-start gap-8">
              <span data-a="meta" class="text-white/85">{d.location}</span>
              <span class="mt-2 hidden h-px w-36 bg-white/50 md:block" />
              <span data-a="meta" class="max-w-[8rem] text-white/85">{d.tagline}</span>
            </div>
            <p data-a="meta" class="hidden max-w-[16rem] text-right leading-relaxed text-white/70 md:block">{d.intro}</p>
          </div>

          <div class="flex-1" />

          <div class="pb-10 md:pl-[12%]">
            <div data-a="eyebrow" class="mb-3 flex items-center gap-3 text-sm text-[var(--rx-accent)]">
              <span class="rx-dash" />{d.eyebrow}
            </div>
            <h1 class="text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1.05] tracking-tight">
              {d.headline.map((line) => (
                <div>{words(line)}</div>
              ))}
            </h1>
          </div>

          <div class="flex flex-wrap gap-3 border-t border-white/15 pt-6">
            {d.ctas.map((c) => (
              <button data-a="bar" type="button" class="rx-cta-card flex items-center gap-3 rounded-xl px-5 py-3 text-sm">
                {c.label}{icons.arrow('h-3.5 w-3.5')}
              </button>
            ))}
          </div>
        </div>

        <div class="grid flex-1 grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div data-a="about" class="mb-3 flex items-center gap-2 text-[11px] text-[var(--rx-accent)]">
              <span class="rx-dash !w-3" />{d.about.eyebrow}
            </div>
            <p data-a="about" class="max-w-[34rem] text-[clamp(1.4rem,2.3vw,2rem)] leading-tight">{d.about.text}</p>
            <div data-a="about" class="mt-8 grid grid-cols-2 gap-6 border-b border-white/15 pb-6 sm:grid-cols-4">
              {d.about.stats.map((s) => (
                <div>
                  <div class="rx-stat-num text-4xl font-light">
                    <span data-count data-value={s.value} data-dec={s.decimals}>{s.value}</span>
                    <span class="text-[var(--rx-accent)]">{s.suffix}</span>
                  </div>
                  <div class="mt-1 text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
            <div data-a="about" class="mt-6 flex items-center justify-between gap-6">
              <p class="max-w-[17rem] text-[10px] leading-relaxed text-white/60">{d.about.note}</p>
              <button type="button" class="rx-btn flex items-center gap-4 rounded-lg py-1.5 pl-4 pr-1.5 text-xs">
                {d.about.cta}<span class="rx-tile h-7 w-7">{icons.arrow('h-3.5 w-3.5')}</span>
              </button>
            </div>
          </div>

          <div>
            <div class="flex items-end justify-between gap-6">
              <div data-a="model">
                <div class="mb-2 flex items-center gap-2 text-[10px] text-[var(--rx-accent)]">
                  <span class="rx-dash !w-3" />{d.models.eyebrow}
                </div>
                <h2 class="text-3xl font-medium tracking-tight">{d.models.title}</h2>
              </div>
              <p data-a="model" class="hidden max-w-[13rem] text-right text-[10px] leading-relaxed text-white/60 sm:block">{d.models.text}</p>
            </div>
            <div data-a="model" class="rx-card mt-4 flex min-h-[12rem] flex-col justify-between rounded-2xl p-5">
              <div class="flex items-center gap-2 text-sm text-white/90">
                <span class="rx-tile !h-5 !w-5 !rounded-full !bg-white/90 !text-black" />{d.models.card.brand}
              </div>
              <div class="text-4xl font-light tracking-tight">{d.models.card.name}</div>
            </div>
          </div>
        </div>

        <span class="rx-star absolute bottom-8 right-5 hidden h-12 w-12 md:block" />
      </section>
    )
  },
})
