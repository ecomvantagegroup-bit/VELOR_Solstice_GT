import { inject } from 'vue'

export default {
  setup() {
    const isReady = inject('isReady')
    const loadProgress = inject('loadProgress')

    return { isReady, loadProgress }
  },

  render() {
    if (this.isReady) return null

    return (
      <div
        role="status"
        aria-live="polite"
        class="
          fixed
          inset-0
          z-20
          flex
          flex-col
          items-center
          justify-center
          gap-4
          bg-[#0a0a0a]
          transition-opacity
          duration-500
        "
      >
        <p class="text-white/70 text-sm tracking-wide">
          Preparing the Solstice GT — {this.loadProgress}%
        </p>

        <div class="w-48 h-px bg-white/20 overflow-hidden">
          <div
            class="h-full bg-white transition-all duration-200 ease-out"
            style={{ width: `${this.loadProgress}%` }}
          />
        </div>
      </div>
    )
  },
}
