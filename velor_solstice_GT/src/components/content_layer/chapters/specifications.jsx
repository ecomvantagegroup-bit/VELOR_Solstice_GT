import { defineComponent, ref } from 'vue';
import { getSectionContent } from '../../../data/content.js';
import { useChapterReveal } from '../../../gsap/useChapterReveal.js';
import './specifications.css';

const content = getSectionContent('specifications');

export default defineComponent({
  name: 'SpecificationsChapter',
  setup() {
    const wrapRef = ref(null);
    const highlightsRef = ref(null);
    const rowsRef = ref(null);

    useChapterReveal(wrapRef, { staggerGroups: [highlightsRef, rowsRef] });

    return () => (
      <div ref={wrapRef} class="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
        {content?.eyebrow && (
          <p class="eyebrow mb-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#F2C83C]">
            {content.eyebrow}
          </p>
        )}

        <div class="flex flex-col justify-between gap-8 md:flex-row">
          <div class="panel-card w-full rounded-[20px] p-8 md:w-[40%]">
            <ul ref={highlightsRef} class="spec-highlights space-y-2">
              {content?.highlights?.map((item) => (
                <li key={item} class="flex gap-3 text-sm font-light italic text-white/70">
                  <span class="font-display text-[#F2C83C]">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div class="panel-card w-full rounded-[20px] p-8 md:w-[40%]">
            <p class="spec-title mb-4 text-xs font-semibold uppercase text-white/60">
              {content?.specsTitle}
            </p>
            <table class="spec-table w-full text-sm">
              <tbody ref={rowsRef}>
                {content?.specs?.map(([label, value]) => (
                  <tr key={label} class="border-b border-white/10">
                    <td class="py-2 text-white/65">{label}</td>
                    <td class="py-2 text-right font-semibold text-white">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
});
