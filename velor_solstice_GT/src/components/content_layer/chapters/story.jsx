import { defineComponent, ref } from 'vue';
import { getSectionContent } from '../../../data/content.js';
import { useChapterReveal } from '../../../gsap/useChapterReveal.js';
import './story.css';

const content = getSectionContent('story');

export default defineComponent({
  name: 'StoryChapter',
  setup() {
    const wrapRef = ref(null);
    const textRef = ref(null);
    const quoteRef = ref(null);

    useChapterReveal(wrapRef, { copyRef: textRef, ctaRef: quoteRef });

    return () => (
      <div ref={wrapRef} class="absolute inset-0 flex flex-col justify-between px-6 py-16 md:px-16">
        <div ref={textRef} class="max-w-xl">
          {content?.eyebrow && (
            <p class="eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F2C83C]">
              {content.eyebrow}
            </p>
          )}
          <h2 class="mb-4 text-3xl font-extrabold italic text-white">{content?.headline}</h2>
          <p class="font-light italic leading-relaxed text-white/70">{content?.body}</p>
        </div>

        <div ref={quoteRef} class="story-quote panel-card mx-auto max-w-xl rounded-[20px] px-10 py-10 text-center">
          <span class="story-quote-mark">&rdquo;</span>
          <p class="story-quote-text text-lg italic leading-relaxed text-white/90">
            {content?.quote?.text}
          </p>
          <p class="mt-3 text-xs uppercase tracking-wide text-white/50">
            — {content?.quote?.attribution}
          </p>
        </div>
      </div>
    );
  },
});
