// src/gsap/useSectionReveal.js
//
// GSAP-driven text/content entrance animation for a section — kept
// completely separate from useSequencePlayer.js. That composable owns
// the canvas frame scrubbing + audio (your existing logic from
// debug.html); this one only fades/staggers the copy in when the
// section scrolls into view.

import { onMounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @param {import('vue').Ref<HTMLElement|null>} triggerRef  element that starts the reveal when it scrolls into view
 * @param {object} opts
 * @param {import('vue').Ref} [opts.copyRef]        single block — fades/slides up
 * @param {import('vue').Ref} [opts.ctaRef]          single block — fades/slides up, slightly after copyRef
 * @param {import('vue').Ref[]} [opts.staggerGroups] refs whose direct children stagger-fade in (bullet lists, table rows)
 * @param {import('vue').Ref} [opts.statRefs]         array ref of stat value elements to count up
 * @param {Array<{value:number, decimals?:number, suffix?:string}>} [opts.stats]  matching data for statRefs
 */
export function useSectionReveal(triggerRef, opts = {}) {
  onMounted(() => {
    if (!triggerRef.value) return;

    const scrollTrigger = {
      trigger: triggerRef.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    };

    const tl = gsap.timeline({ scrollTrigger });

    if (opts.copyRef?.value) {
      tl.fromTo(
        opts.copyRef.value,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );
    }

    if (opts.ctaRef?.value) {
      tl.fromTo(
        opts.ctaRef.value,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      );
    }

    (opts.staggerGroups || []).forEach((groupRef) => {
      if (!groupRef?.value?.children?.length) return;
      tl.fromTo(
        groupRef.value.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
        '-=0.3'
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
          duration: 1.4,
          ease: 'power1.out',
          scrollTrigger,
          onUpdate: () => {
            const formatted = stat.decimals ? counter.val.toFixed(stat.decimals) : Math.round(counter.val);
            el.textContent = `${formatted}${stat.suffix || ''}`;
          },
        });
      });
    }
  });
}
