import { defineComponent, ref } from 'vue';
import { getSectionContent } from '../../../data/content.js';
import { useChapterReveal } from '../../../gsap/useChapterReveal.js';
import './precision.css';

const content = getSectionContent('precision');

export default defineComponent({
  name: 'PrecisionChapter',
  setup() {
    const wrapRef = ref(null);
    const cardRef = ref(null);

    useChapterReveal(wrapRef, { copyRef: cardRef });

    return () => (
      <div ref={wrapRef} class="absolute inset-0 flex items-center justify-center px-6">
        <div ref={cardRef} class="precision-card panel-card max-w-xl rounded-[20px] p-10 text-center">
          {content?.eyebrow && (
            <p class="precision-eyebrow eyebrow mb-3 justify-center text-xs font-semibold uppercase text-[#F2C83C]">
              {content.eyebrow}
            </p>
          )}
          <h2 class="mb-4 text-3xl font-extrabold italic text-white">{content?.headline}</h2>
          <p class="font-light italic leading-relaxed text-white/70">{content?.body}</p>
        </div>
      </div>
    );
  },
});
