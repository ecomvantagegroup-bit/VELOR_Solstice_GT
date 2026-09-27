// src/gsap/useChapterReveal.js
//
// Chapters in the new architecture mount and unmount as the visitor
// crosses chapter boundaries (see content_layer/index.jsx's <transition>),
// rather than living permanently in the document and scrolling into view.
// So unlike the old useSectionReveal.js, this has no ScrollTrigger — it
// just plays once on mount, layered on top of content_layer's own
// enter/leave crossfade.

import { onMounted } from 'vue';
import gsap from 'gsap';

/**
 * @param {import('vue').Ref<HTMLElement|null>} rootRef  unused directly, kept for symmetry with useSectionReveal's signature
 * @param {object} opts
 * @param {import('vue').Ref} [opts.copyRef]
 * @param {import('vue').Ref} [opts.ctaRef]
 * @param {import('vue').Ref[]} [opts.staggerGroups]
 * @param {import('vue').Ref} [opts.statRefs]
 * @param {Array<{value:number, decimals?:number, suffix?:string}>} [opts.stats]
 */
export function useChapterReveal(rootRef, opts = {}) {
  onMounted(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (opts.copyRef?.value) {
      tl.fromTo(opts.copyRef.value, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.65 });
    }

    if (opts.ctaRef?.value) {
      tl.fromTo(
        opts.ctaRef.value,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      );
    }

    (opts.staggerGroups || []).forEach((groupRef) => {
      if (!groupRef?.value?.children?.length) return;
      tl.fromTo(
        groupRef.value.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
        '-=0.25'
      );
    });

    if (opts.statRefs?.value?.length && opts.stats?.length) {
      opts.statRefs.value.forEach((el, i) => {
        if (!el) return;
        const stat = opts.stats[i];
        if (!stat) return;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: parseFloat(stat.value),
          duration: 1.1,
          ease: 'power1.out',
          delay: 0.15,
          onUpdate: () => {
            const formatted = stat.decimals ? counter.val.toFixed(stat.decimals) : Math.round(counter.val);
            el.textContent = `${formatted}${stat.suffix || ''}`;
          },
        });
      });
    }
  });
}
