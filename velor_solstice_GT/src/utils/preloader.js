import { createAudioManager } from './audioControl.js'

const BASE = import.meta.env.BASE_URL
const CONFIG_URL = `${BASE}config/sequenceConfig.json`

// how many image requests are in flight at once
const CONCURRENCY = 12
// one audio file is much heavier than one frame, so it counts for more of the progress bar
const AUDIO_WEIGHT = 10

// section name -> decoded HTMLImageElement[]  (sequenceCanvas reads from here, so nothing loads twice)
export const preloadedImages = new Map()

const assetUrl = (path) => `${BASE}${path.replace(/^\/+/, '')}`

function frameUrls({ path, start, end, extension = '.webp', pad = 4 }) {
  const urls = []
  for (let i = start; i <= end; i++) {
    urls.push(assetUrl(`${path}${String(i).padStart(pad, '0')}${extension}`))
  }
  return urls
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try { await img.decode() } catch { /* still usable without decode() */ }
      resolve(img)
    }
    img.onerror = () => reject(new Error(src))
    img.src = src
  })
}

async function runPool(tasks, limit) {
  let next = 0
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++
      await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
}

/**
 * Loads every frame and every audio file listed in sequenceConfig.json.
 * onProgress(fraction 0..1) is called as files finish.
 * Never rejects for a single missing file: failures are collected in `failed` (full URLs).
 * Resolves with { failed, resume } - resume() unlocks the AudioContext (call it from a click).
 */
export async function preloadEverything(onProgress = () => { }) {
  const res = await fetch(CONFIG_URL)
  if (!res.ok) throw new Error(`Config not found (HTTP ${res.status}): ${CONFIG_URL}`)
  const { sections = [] } = await res.json()
  if (!sections.length) throw new Error(`No sections in ${CONFIG_URL}`)

  const totalFrames = sections.reduce((n, s) => n + (s.images.end - s.images.start + 1), 0)
  const total = totalFrames + sections.length * AUDIO_WEIGHT
  let done = 0
  const failed = []

  const tick = (n = 1) => {
    done += n
    onProgress(Math.min(done / total, 1))
  }

  // ---- images (sections in JSON order, so hero frames arrive first)
  const tasks = []
  for (const section of sections) {
    const urls = frameUrls(section.images)
    const list = new Array(urls.length)
    preloadedImages.set(section.name, list)

    urls.forEach((url, i) => {
      tasks.push(async () => {
        try {
          list[i] = await loadImage(url)
        } catch {
          failed.push(url)
        }
        tick()
      })
    })
  }

  // ---- audio (decoded + reversed buffers are cached inside audioControl.js)
  let audioManager = null
  const audioJob = (async () => {
    try {
      audioManager = await createAudioManager()
    } catch (err) {
      console.error('[preloader] audio manager:', err)
      failed.push(...sections.map((s) => assetUrl(s.audio?.path || s.name)))
      tick(sections.length * AUDIO_WEIGHT)
      return
    }
    for (const section of sections) {
      try {
        await audioManager.preload([section.name])
      } catch (err) {
        console.error('[preloader] audio:', err)
        failed.push(assetUrl(section.audio?.path || section.name))
      }
      tick(AUDIO_WEIGHT)
    }
  })()

  await Promise.all([runPool(tasks, CONCURRENCY), audioJob])

  return {
    failed,
    resume: async () => { await audioManager?.resume() },
  }
}
