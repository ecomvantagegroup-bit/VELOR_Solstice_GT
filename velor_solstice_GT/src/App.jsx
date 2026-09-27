import { defineComponent, ref, onMounted } from 'vue';
import { loadConfig } from './data/content.js';


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
          
          <div id="scroll-area" class="relative min-h-[600vh] bg-[#0a0a0a]">
            <div class="sticky top-0 h-screen w-screen overflow-hidden">
             
            </div>
          </div>
          
        </div>
      );
    };
  },
});
