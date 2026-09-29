import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../../data/sectionsText.json'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

const svg = 'fill-none stroke-current'
const icons = {
  search: (c = 'h-4 w-4') => (
    <svg class={`${c} ${svg}`} viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  chevron: (c = 'h-4 w-4') => (
    <svg class={`${c} ${svg}`} viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  menu: (c = 'h-5 w-5') => (
    <svg class={`${c} ${svg}`} viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (c = 'h-5 w-5') => (
    <svg class={`${c} ${svg}`} viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
}

export default defineComponent({
  name: 'Navbar',
  setup() {
    const d = data.navbar
    const root = ref(null)
    const drawer = ref(null)
    const open = ref(false)
    let ctx

    const toggle = () => {
      open.value = !open.value
      gsap.to(drawer.value, {
        autoAlpha: open.value ? 1 : 0,
        y: open.value ? 0 : -12,
        duration: 0.35,
        ease: 'power3.out',
      })
      if (open.value) gsap.from('[data-a="drawer-item"]', { autoAlpha: 0, x: 16, stagger: 0.06, duration: 0.4, delay: 0.1 })
    }

    onMounted(() => {
      ctx = gsap.context(() => {
        gsap.set(drawer.value, { autoAlpha: 0, y: -12 })
        // glass background once the page has scrolled
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => root.value.classList.toggle('is-scrolled', self.scroll() > 40),
        })
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-a="brand"]', { autoAlpha: 0, x: -24, duration: 0.7 })
          .from('[data-a="link"]', { autoAlpha: 0, y: -14, stagger: 0.08, duration: 0.5 }, '-=0.4')
          .from('[data-a="tool"]', { autoAlpha: 0, y: -14, stagger: 0.1, duration: 0.5 }, '-=0.4')
      }, root.value)
    })
    onBeforeUnmount(() => ctx && ctx.revert())

    return () => (
      <div ref={root} class="rx-section rx-nav">
        <div class="rx-bar flex items-center justify-between gap-6 px-6 py-5 text-white md:px-[3.5%]">
          <a href="#" data-a="brand" class="text-2xl font-semibold tracking-[0.12em]">{d.brand}</a>

          <nav class="hidden items-center gap-9 text-sm lg:flex">
            {d.links.map((l) => (
              <a data-a="link" href="#" class="rx-link">{l}</a>
            ))}
          </nav>

          <div class="flex items-center gap-3">
            <div data-a="tool" class="rx-glass hidden h-11 items-center overflow-hidden rounded-xl border border-white/15 md:flex">
              <button type="button" class="flex items-center gap-8 px-4 text-sm text-white/90">
                {d.filter}{icons.chevron()}
              </button>
              <span class="h-6 w-px bg-white/20" />
              <input
                type="text"
                placeholder={d.searchPlaceholder}
                class="w-44 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/60"
              />
              <button type="button" aria-label="Search" class="rx-tile m-1 h-9 w-9">{icons.search()}</button>
            </div>

            <button data-a="tool" type="button" class="rx-btn hidden rounded-xl px-5 py-2.5 text-sm sm:block">{d.cta}</button>

            <button
              data-a="tool"
              type="button"
              aria-label={d.menuLabel}
              aria-expanded={open.value}
              onClick={toggle}
              class="rx-glass grid h-11 w-11 place-items-center rounded-xl border border-white/15"
            >
              {open.value ? icons.close() : icons.menu()}
            </button>
          </div>
        </div>

        <div ref={drawer} class="rx-drawer absolute right-6 top-full mt-1 w-72 rounded-2xl p-5 text-white md:right-[3.5%]">
          <ul class="space-y-4 text-lg">
            {d.links.map((l) => (
              <li data-a="drawer-item"><a href="#" class="block hover:text-[var(--rx-accent)]" onClick={toggle}>{l}</a></li>
            ))}
          </ul>
          <button data-a="drawer-item" type="button" class="rx-btn mt-6 w-full rounded-xl px-5 py-3 text-sm">{d.cta}</button>
        </div>
      </div>
    )
  },
})
