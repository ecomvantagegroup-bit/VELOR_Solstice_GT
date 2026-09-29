import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Footer.css'

gsap.registerPlugin(ScrollTrigger)

export default defineComponent({
  name: 'FooterSection',
  setup() {
    const d = data.footer
    const root = ref(null)
    let ctx

    onMounted(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      ctx = gsap.context(() => {
        gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: root.value, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
          .from('[data-a="rule"]', { scaleX: 0, transformOrigin: 'left center', duration: 1 })
          .from('[data-a="col"]', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.7 }, '-=0.6')
          .from('[data-a="item"]', { autoAlpha: 0, x: -14, stagger: 0.04, duration: 0.5 }, '-=0.5')
          .from('[data-a="mark"]', { autoAlpha: 0, yPercent: 30, duration: 1.1 }, '-=0.6')
          .from('[data-a="bottom"]', { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.6 }, '-=0.6')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <footer
        ref={root}
        class="rx-section rx-footer relative flex min-h-[80vh] w-full flex-col justify-between overflow-hidden px-6 pb-6 pt-16 text-white md:px-[6%]"
      >
        <div>
          <div data-a="rule" class="mb-10 h-px w-full bg-[var(--rx-hair)]" />
          <div class="grid grid-cols-2 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {d.columns.map((col, i) => (
              <div data-a="col" class={i === 0 ? 'col-span-2 lg:col-span-1' : ''}>
                <div class="rx-col-title mb-5 flex items-center gap-3 text-xs uppercase text-[var(--rx-accent)]">
                  <span class="rx-dash !w-3" />{col.title}
                </div>
                {col.lines && (
                  <div class="max-w-[16rem] space-y-2">
                    {col.lines.map((l, j) => (
                      <p data-a="item" class={j === 0 ? 'text-xl font-medium' : 'text-sm leading-relaxed text-white/60'}>{l}</p>
                    ))}
                  </div>
                )}
                {col.links && (
                  <ul class="space-y-3 text-base">
                    {col.links.map((l) => (
                      <li data-a="item"><a href="#" class="rx-link">{l}</a></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div data-a="mark" class="rx-wordmark my-10 text-center">{d.brand}</div>
          <div class="flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-5 text-xs text-white/55 md:flex-row md:items-center">
            <p data-a="bottom" class="max-w-xl leading-relaxed">{d.legal}</p>
            <p data-a="bottom" class="text-sm text-white/80">{d.tagline}</p>
          </div>
        </div>

        <span class="rx-star absolute right-5 top-6 hidden h-10 w-10 md:block" />
      </footer>
    )
  },
})
