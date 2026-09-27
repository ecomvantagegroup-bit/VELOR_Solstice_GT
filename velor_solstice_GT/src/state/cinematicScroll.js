// src/state/cinematicScroll.js
//
// Single source of truth for "where are we in the whole cinematic
// experience", shared by background_layer (which chapter's frames/audio
// to play) and content_layer (which chapter's copy to show).
//
// Each chapter's scroll length is computed directly from
// sequenceConfig.json's `images.start`/`images.end`/`scroll.pixelsPerFrame`
// — the same numbers imageSequence.js uses to build its frame URL list —
// so the total scrollable height is known before any image ever loads.
// Chapters are laid out as non-overlapping, ordered pixel ranges
// (chapter 2's range only starts where chapter 1's ends), so scrolling
// physically cannot reach chapter 2 until chapter 1's full frame range
// has been scrubbed through — same guarantee the old per-section
// useSequencePlayer.js gave via its own pin/scrub runway, just applied
// across chapters sharing one runway instead of N separate ones.

import { reactive } from 'vue';
import { getSection } from '../data/content.js';

export const CHAPTER_ORDER = ['hero', 'silhouette', 'precision', 'specifications', 'story'];

export const cinematicState = reactive({
  chapterIndex: 0,
  chapterProgress: 0,
  direction: 0,
  ready: false,
});

let ranges = null;
let totalScrollLength = 0;
let scrollAreaEl = null;
let lastY = 0;
let queued = false;
let stopTimer = null;
let attached = false;

function buildRanges() {
  let cursor = 0;
  const built = [];

  for (const name of CHAPTER_ORDER) {
    const section = getSection(name);

    if (!section) {
      console.error(
        `[cinematicScroll] No section named "${name}" in sequenceConfig.json — ` +
        `check CHAPTER_ORDER matches your JSON's section names exactly.`
      );
      continue;
    }

    const { start, end } = section.images || {};

    if (typeof start !== 'number' || typeof end !== 'number') {
      console.error(
        `[cinematicScroll] Section "${name}" is missing images.start/images.end — ` +
        `got start=${start}, end=${end}. Skipping its scroll range.`
      );
      continue;
    }

    const totalFrames = Math.max(1, end - start + 1);
    const pixelsPerFrame = section.scroll?.pixelsPerFrame || 10;
    const length = totalFrames * pixelsPerFrame;

    built.push({
      name,
      totalFrames,
      pixelsPerFrame,
      length,
      startY: cursor,
      endY: cursor + length,
    });

    cursor += length;
  }

  if (!built.length) {
    console.error('[cinematicScroll] No valid chapter ranges were built — nothing will scroll.');
  }

  return built;
}

function setScrollAreaHeight() {
  if (!scrollAreaEl) return;
  scrollAreaEl.style.height = `${totalScrollLength + window.innerHeight}px`;
}

function findChapterIndexForY(y) {
  for (let i = 0; i < ranges.length; i++) {
    if (y < ranges[i].endY || i === ranges.length - 1) return i;
  }
  return ranges.length - 1;
}

function onScroll() {
  queued = false;
  if (!scrollAreaEl || !ranges || !ranges.length) return;

  // How far we've scrolled into the whole pinned experience — same
  // getBoundingClientRect() trick the old per-section player used,
  // just measured against the one big scroll-area now.
  const rect = scrollAreaEl.getBoundingClientRect();
  const y = Math.min(totalScrollLength, Math.max(0, -rect.top));

  if (y > lastY) cinematicState.direction = 1;
  else if (y < lastY) cinematicState.direction = -1;
  lastY = y;

  const index = findChapterIndexForY(y);
  const range = ranges[index];
  const localY = y - range.startY;
  const progress = range.length > 0 ? Math.max(0, Math.min(1, localY / range.length)) : 0;

  cinematicState.chapterIndex = index;
  cinematicState.chapterProgress = progress;

  clearTimeout(stopTimer);
  stopTimer = setTimeout(() => {
    cinematicState.direction = 0;
  }, 120);
}

function requestTick() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(onScroll);
}

// Call once, after loadConfig() has resolved (so getSection() has data),
// with the id of the tall scroll-area div that wraps the sticky viewport.
export function attachCinematicScroll(scrollAreaId) {
  if (attached) return;

  scrollAreaEl = document.getElementById(scrollAreaId);

  if (!scrollAreaEl) {
    console.error(
      `[cinematicScroll] #${scrollAreaId} not found in the DOM. ` +
      `attachCinematicScroll() must run after that element has mounted.`
    );
    return;
  }

  ranges = buildRanges();

  if (!ranges.length) return;

  totalScrollLength = ranges[ranges.length - 1].endY;
  setScrollAreaHeight();

  window.addEventListener('resize', setScrollAreaHeight);
  window.addEventListener('scroll', requestTick, { passive: true });

  attached = true;
  onScroll();
}

export function getChapterRanges() {
  return ranges;
}
