import { defineComponent, ref, onMounted } from 'vue';
import { loadConfig } from './data/content.js';

import Navbar from './components/content_layer/Navbar/Navbar.jsx';
import BackgroundLayer from './components/background_layer/index.jsx';
import ContentLayer from './components/content_layer/index.jsx';
import Footer from './components/site_footer/index.jsx';

export default defineComponent({
  name: 'App',
  setup() {
    const ready = ref(false);
    const loadError = ref(null);

    onMounted(async () => {
      try {
        await loadConfig();
        ready.value = true;
      } catch (err) {
        console.error('Failed to load sequenceConfig.json:', err);
        loadError.value = err;
      }
    });

    return () => {
      if (loadError.value) {
        return (
          <div class="flex h-screen items-center justify-center bg-black text-white/60">
            Failed to load content. Please refresh.
          </div>
        );
      }

      if (!ready.value) {
        return (
          <div class="flex h-screen items-center justify-center bg-black text-white/40">
            Loading…
          </div>
        );
      }

      return (
        <div class="bg-black">
          <Navbar />

          {/* The whole cinematic experience: one shared canvas
              (BackgroundLayer) + one crossfading copy layer
              (ContentLayer), both driven by cinematicScroll.js.
              Height starts at the min-h-[600vh] fallback below and
              is immediately overridden by cinematicScroll's own
              setScrollAreaHeight() once it knows the real frame
              counts, same as useSequencePlayer.js used to do
              per-section. */}
          <div id="scroll-area" class="relative min-h-[600vh] bg-[#0a0a0a]">
            <div class="sticky top-0 h-screen w-screen overflow-hidden">
              <BackgroundLayer />
              <ContentLayer />
            </div>
          </div>
          <Footer />
        </div>
      );
    };
  },
});
