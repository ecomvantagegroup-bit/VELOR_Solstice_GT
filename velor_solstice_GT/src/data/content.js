// src/data/content.js
//
// Single source of truth for all page copy. Everything here is read
// straight out of sequenceConfig.json (served from /public) — nothing
// is hardcoded in the section components themselves.
//
// Because the JSON lives in `public/`, it can't be statically imported —
// it must be fetched at runtime. Call `loadConfig()` once (e.g. in
// App.jsx's onMounted) before any component tries to read from this file.

let config = null;
let loadPromise = null;

// Live-binding export for consumers that want to `import { footerContent }`
// directly rather than calling getFooterContent(). ES module bindings are
// live, so this updates in place once loadConfig() resolves — but it's
// still null until then, so only read it after `ready` is true, same as
// every getXContent() function below.
export let footerContent = null;

export function loadConfig() {
  if (config) return Promise.resolve(config);
  if (loadPromise) return loadPromise; // avoid duplicate fetches if called from multiple components

  loadPromise = fetch(`${import.meta.env.BASE_URL}config/sequenceConfig.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load sequenceConfig.json: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      config = data;
      footerContent = data.footer || null;
      return config;
    });

  return loadPromise;
}

export function isConfigLoaded() {
  return config !== null;
}

export function getSection(name) {
  return config?.sections?.find((s) => s.name === name) || null;
}

export function getSectionContent(name) {
  return getSection(name)?.content || null;
}

export function getSectionMeta(name) {
  const section = getSection(name);
  if (!section) return null;
  // eslint-disable-next-line no-unused-vars
  const { images, audio, scroll, ...meta } = section;
  return meta;
}

export function getNavbarContent() {
  return config?.navbar || null;
}

export function getFinalRevealContent() {
  return config?.finalReveal || null;
}

export function getFooterContent() {
  return config?.footer || null;
}
