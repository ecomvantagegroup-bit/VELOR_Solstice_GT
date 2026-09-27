import { defineComponent, ref } from 'vue';
import { getSectionContent } from '../../../data/content.js';
import { useChapterReveal } from '../../../gsap/useChapterReveal.js';
import './silhouette.css';

const content = getSectionContent('silhouette');

export default defineComponent({
  name: 'SilhouetteChapter',
  setup() {
    const wrapRef = ref(null);
    const copyRef = ref(null);
    const highlightsRef = ref(null);

    useChapterReveal(wrapRef, { copyRef, staggerGroups: [highlightsRef] });

    return () => (
      <div ref={wrapRef} class="absolute inset-0 flex flex-col justify-end px-6 pb-16 md:px-16">
        {content?.eyebrow && (
          <p class="eyebrow mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#F2C83C]">
            {content.eyebrow}
          </p>
        )}

        <div class="flex flex-col justify-between gap-8 md:flex-row">
          <div ref={copyRef} class="panel-card w-full rounded-[20px] p-8 md:w-[38%]">
            <h2 class="mb-4 text-2xl font-extrabold italic text-white">{content?.headline}</h2>
            <p class="font-light italic leading-relaxed text-white/70">{content?.body}</p>
          </div>

          <div class="panel-card w-full rounded-[20px] p-8 md:w-[38%]">
            <h3 class="mb-4 text-xl font-extrabold italic text-white">
              {content?.highlightsTitle}
            </h3>
            <ul ref={highlightsRef} class="silhouette-highlights space-y-2">
              {content?.highlights?.map((item) => (
                <li key={item} class="flex gap-3 text-sm font-light italic text-white/70">
                  <span class="font-display text-[#F2C83C]">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  },
});
