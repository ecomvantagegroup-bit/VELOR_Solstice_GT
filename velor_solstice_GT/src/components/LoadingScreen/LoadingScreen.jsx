import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { preloadEverything } from '../../utils/preloader.js'
import './LoadingScreen.css'

gsap.registerPlugin(ScrollTrigger)

// after `enter` is emitted, App mounts ContentLayer; give it a moment to attach its
// ScrollTriggers and draw the first hero frame before the cover lifts
const MOUNT_SETTLE_MS = 450

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const arrow = (
  <svg class="ls-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default defineComponent({
  name: 'LoadingScreen',
  emits: ['enter'],
  setup(_, { emit }) {
    const root = ref(null)
    const btn = ref(null)
    const percent = ref(0)
    const phase = ref('loading') // loading | ready | error | leaving
    const failed = ref([])
    const gone = ref(false)

    const shown = { v: 0 }
    let resumeAudio = async () => {}
    let tween = null
    let timer = null

    const lock = (on) => document.documentElement.classList.toggle('ls-lock', on)

    // the counter eases toward the real value instead of jumping
    const showProgress = (fraction) => {
      const to = Math.round(fraction * 100)
      tween?.kill()
      if (reduced()) { shown.v = to; percent.value = to; return }
      tween = gsap.to(shown, {
        v: to, duration: 0.45, ease: 'power1.out',
        onUpdate: () => { percent.value = Math.round(shown.v) },
      })
    }

    const finishProgress = () =>
      new Promise((resolve) => {
        tween?.kill()
        if (reduced()) { shown.v = 100; percent.value = 100; return resolve() }
        tween = gsap.to(shown, {
          v: 100, duration: 0.6, ease: 'power2.out',
          onUpdate: () => { percent.value = Math.round(shown.v) },
          onComplete: resolve,
        })
      })

    onMounted(async () => {
      lock(true)
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)

      try {
        const result = await preloadEverything(showProgress)
        resumeAudio = result.resume
        failed.value = result.failed
        await finishProgress()
        phase.value = result.failed.length ? 'error' : 'ready'
      } catch (err) {
        console.error('[LoadingScreen]', err)
        failed.value = [String(err.message || err)]
        phase.value = 'error'
      }
    })

    watch(phase, async (p) => {
      if (p === 'ready' || p === 'error') {
        await nextTick()
        btn.value?.focus()
      }
    })

    // The click is a real user gesture, so the AudioContext can be resumed here and the
    // audio is already unlocked when the hero appears.
    const enter = async () => {
      if (phase.value === 'leaving') return
      phase.value = 'leaving'

      try { await resumeAudio() } catch (err) { console.warn('[LoadingScreen] audio resume:', err) }

      emit('enter')
      await new Promise((r) => { timer = setTimeout(r, MOUNT_SETTLE_MS) })
      ScrollTrigger.refresh()

      const finish = () => {
        lock(false)
        gone.value = true
        ScrollTrigger.refresh()
      }
      if (reduced()) return finish()

      gsap.to(root.value, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1,
        ease: 'power4.inOut',
        onComplete: finish,
      })
    }

    onBeforeUnmount(() => {
      tween?.kill()
      clearTimeout(timer)
      lock(false)
    })

    return () => {
      if (gone.value) return null

      const p = percent.value
      const canEnter = phase.value === 'ready' || phase.value === 'error'
      const label =
        phase.value === 'error' ? 'Some files did not load'
        : canEnter || phase.value === 'leaving' ? 'Ready'
        : 'Loading frames and audio'

      return (
        <div
          ref={root}
          class={['ls-root', phase.value === 'leaving' && 'ls-leaving']}
          role="status"
          aria-live="polite"
          aria-busy={phase.value === 'loading'}
        >
          <div class="ls-inner">
            <p class="ls-label"><span class="ls-dash" />{label}</p>

            <div class="ls-count" aria-label={`${p} percent loaded`}>
              {p}<span class="ls-unit">%</span>
            </div>

            <div class="ls-track"><span class="ls-fill" style={{ transform: `scaleX(${p / 100})` }} /></div>

            <div class="ls-foot">
              {phase.value === 'error' && (
                <p class="ls-error">
                  {failed.value.length} file{failed.value.length > 1 ? 's' : ''} failed. First one: <code>{failed.value[0]}</code>
                </p>
              )}
              {canEnter && (
                <button ref={btn} type="button" class="ls-btn" onClick={enter}>
                  {phase.value === 'error' ? 'Enter anyway' : 'Enter'}{arrow}
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }
  },
})