// src/components/loading_screen/index.jsx
//
// Watches the same cinematicState that background_layer writes to.
// `ready` flips true once the first chapter's image sequence + audio
// have loaded, at which point this fades itself out and unmounts.

import gsap from 'gsap'
import { cinematicState } from '../../state/cinematicScroll.js'
import './index.css'

export default {
  name: 'LoadingScreen',

  data() {
    return {
      hidden: false,
    }
  },

  computed: {
    cinematicReady() {
      return cinematicState.ready
    },
  },

  watch: {
    cinematicReady(isReady) {
      if (isReady) this.fadeOut()
    },
  },

  mounted() {
    // In case background_layer finished loading before this even mounted.
    if (cinematicState.ready) this.fadeOut()
  },

  methods: {
    fadeOut() {
      if (!this.$refs.screen) {
        this.hidden = true
        return
      }
      gsap.to(this.$refs.screen, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          this.hidden = true
        },
      })
    },
  },

  render() {
    if (this.hidden) return null

    return (
      <div ref="screen" class="loading-screen fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <div class="loading-mark text-sm uppercase tracking-[0.3em] text-white/60">VELOR — Loading</div>
      </div>
    )
  },
}
