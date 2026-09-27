import { defineComponent, ref } from 'vue';
import { getSectionContent } from '../../../data/content.js';
import { useChapterReveal } from '../../../gsap/useChapterReveal.js';
import './hero.css';

const content = getSectionContent('hero');

export default defineComponent({
  name: 'HeroChapter',
  setup() {
    const wrapRef = ref(null);
    const copyRef = ref(null);
    const ctaRef = ref(null);
    const statRefs = ref([]);

    useChapterReveal(wrapRef, {
      copyRef,
      ctaRef,
      statRefs,
      stats: content?.stats,
    });

    return () => (
      <div ref={wrapRef} class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />

        <div class="relative z-10 flex h-full max-w-2xl flex-col justify-center gap-6 px-10 md:px-16">
          <div ref={copyRef}>
            <h1 class="hero-title text-5xl font-extrabold italic text-white md:text-6xl">
              {content?.headline}
            </h1>
            <p class="mt-4 text-lg font-semibold text-white/90">{content?.subheadline}</p>
            <p class="mt-4 max-w-lg font-light italic leading-relaxed text-white/70">
              {content?.body}
            </p>
          </div>

          <div ref={ctaRef} class="mt-2 flex flex-wrap gap-4">
            {content?.ctas?.map((cta, i) => (
              <button
                key={cta.label}
                class={
                  i === 0
                    ? 'btn-gold rounded-[14px] px-8 py-4 font-semibold'
                    : 'btn-outline rounded-[14px] px-8 py-4 font-semibold'
                }
              >
                {cta.label}
              </button>
            ))}
          </div>

          <div class="hero-stats mt-8">
            {content?.stats?.map((stat, i) => (
              <div key={stat.label} class="hero-stat">
                <div
                  ref={(el) => (statRefs.value[i] = el)}
                  class="hero-stat-value font-display text-2xl font-extrabold italic text-[#F2C83C]"
                >
                  0
                </div>
                <div class="hero-stat-label mt-1 text-xs uppercase text-white/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
