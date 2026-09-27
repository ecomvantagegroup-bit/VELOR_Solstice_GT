// src/composables/useSequencePlayer.js
//
// This is the SAME logic as debug.html (loadImageSequence + createAudioManager
// + scroll → progress → setProgress/setSection/setProgress), just generalized
// so every section on the real page can run its own pinned scrub-and-audio
// region instead of debug.html's single full-document version.
//
// Nothing about how frames/audio are loaded or played is changed here —
// that's entirely owned by ../utils/imageSequence.js and ../utils/audioControl.js
// (your files, untouched). This only adapts the *scroll math* so it works
// per-section instead of on `window` + `document.body` alone.
//
// Assumes this file lives at src/composables/, and your utils live at
// src/utils/imageSequence.js and src/utils/audioControl.js. Adjust the
// two import paths below if your project layout differs.

import { onMounted, onBeforeUnmount, ref } from 'vue';
import { loadImageSequence } from '../utils/imageSequence.js';
import { createAudioManager } from '../utils/audioControl.js';

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

/**
 * @param {import('vue').Ref<HTMLElement|null>} sectionRef  the <section> wrapper — its scroll height becomes the scrub runway
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef  the <canvas> the frames draw into
 * @param {string} sectionName  must match a `name` entry in sequenceConfig.json
 */
export function useSequencePlayer(sectionRef, canvasRef, sectionName) {
  const progress = ref(0);
  const ready = ref(false);
  const totalFrames = ref(0);

  let sequence = null;
  let audio = null;
  let scrollLength = 0;
  let started = false;
  let direction = 0;
  let lastY = 0;
  let stopTimer = null;
  let queued = false;

  function setScrollHeight() {
    if (!sequence || !sectionRef.value) return;
    const perFrame = sequence.section?.scroll?.pixelsPerFrame || 10;
    scrollLength = sequence.totalFrames * perFrame;
    // The section's own height becomes the scrub runway; the sticky
    // inner wrapper (see SequenceSection.jsx) stays pinned for that span.
    sectionRef.value.style.height = `${scrollLength + window.innerHeight}px`;
  }

  function onScroll() {
    queued = false;
    if (!sectionRef.value || !sequence) return;

    // How far we've scrolled *into this section* specifically —
    // debug.html used window.scrollY directly because it only ever
    // tested one section filling the whole document.
    const rect = sectionRef.value.getBoundingClientRect();
    const y = Math.min(scrollLength, Math.max(0, -rect.top));

    if (y > lastY) direction = 1;
    else if (y < lastY) direction = -1;
    lastY = y;

    const p = scrollLength > 0 ? Math.max(0, Math.min(1, y / scrollLength)) : 0;
    progress.value = p;
    sequence.setProgress(p);

    if (audio && started) {
      audio.setProgress(p, direction).catch(() => { });
    }

    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      audio?.pause();
      direction = 0;
    }, 120);
  }

  function requestScrollTick() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  }

  async function tryUnlock() {
    if (!audio || started) return;
    try {
      await audio.resume();
      started = true;
      UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, tryUnlock));
    } catch {
      // Will retry on the next gesture.
    }
  }

  onMounted(async () => {
    if (!canvasRef.value) return;

    sequence = await loadImageSequence(canvasRef.value, sectionName);
    totalFrames.value = sequence.totalFrames;
    setScrollHeight();
    ready.value = true;

    window.addEventListener('resize', setScrollHeight);
    window.addEventListener('scroll', requestScrollTick, { passive: true });
    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, tryUnlock, { passive: true }));

    onScroll();

    try {
      audio = await createAudioManager();
      await audio.setSection(sectionName, 0);
      tryUnlock();
    } catch (error) {
      // Audio is optional — sequence keeps working image-only, same as debug.html.
      console.warn(`[${sectionName}] audio unavailable:`, error?.message || error);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', setScrollHeight);
    window.removeEventListener('scroll', requestScrollTick);
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, tryUnlock));
    clearTimeout(stopTimer);
  });

  return { progress, ready, totalFrames };
}
