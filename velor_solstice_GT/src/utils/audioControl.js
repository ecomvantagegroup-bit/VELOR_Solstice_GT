


const SEQUENCE_JSON_PATH = `${import.meta.env.BASE_URL}config/sequenceConfig.json`;

const RESYNC_THRESHOLD = 0.12;


const FADE = 0.015;

const EPSILON = 0.00001;

let audioContext = null;
let sections = [];

const audioCache = new Map();

let currentSection = null;
let currentAudioPath = null;
let currentBuffer = null;
let currentReversedBuffer = null;

let source = null;
let gainNode = null;

// Where the active source was started, so we can work out the
// live playhead without polling.
let sourceStartTime = 0;
let sourceStartOffset = 0;

let progress = 0;
let direction = 0;
let isPlaying = false;
let volume = 1;


// --------------------------------------------------
// Config
// --------------------------------------------------

async function loadSequenceConfig() {
  const response = await fetch(SEQUENCE_JSON_PATH);

  if (!response.ok) {
    throw new Error(
      `Failed to load sequence JSON: ${SEQUENCE_JSON_PATH}`
    );
  }

  return response.json();
}


function getSection(sectionName) {
  const section = sections.find(
    (item) => item.name === sectionName
  );

  if (!section) {
    throw new Error(
      `Section "${sectionName}" not found in sequence JSON`
    );
  }

  return section;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}


// --------------------------------------------------
// Initialize
// --------------------------------------------------

export async function createAudioManager() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const config = await loadSequenceConfig();

  sections = config.sections || [];

  if (!sections.length) {
    throw new Error("No sections found in sequence JSON");
  }

  return {
    setSection,
    play,
    pause,
    forward,
    backward,
    setProgress,
    getProgress,
    getDirection,
    getState,
    preload,
    setVolume,
    resume,
    destroy,
  };
}


// --------------------------------------------------
// Load + decode audio for a section
// --------------------------------------------------

async function loadAudio(sectionName) {
  if (audioCache.has(sectionName)) {
    return audioCache.get(sectionName);
  }

  const section = getSection(sectionName);
  const configuredAudioPath = section.audio?.path;

  if (!configuredAudioPath) {
    throw new Error(
      `No audio path configured for section "${sectionName}"`
    );
  }

  const audioPath = assetUrl(configuredAudioPath);

  const response = await fetch(audioPath);

  if (!response.ok) {
    throw new Error(`Failed to load audio: ${audioPath}`);
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    throw new Error(
      `${audioPath} returned HTML, not audio. The file is probably missing.`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength < 1024) {
    throw new Error(
      `${audioPath} is only ${arrayBuffer.byteLength} bytes - not a real audio file.`
    );
  }

  let originalBuffer;

  try {
    originalBuffer =
      await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    throw new Error(
      `Could not decode ${audioPath} (${contentType || "unknown type"}). ` +
      `Check the file is a valid mp3.`
    );
  }

  const audioData = {
    audioPath,
    originalBuffer,
    reversedBuffer:
      createReversedBuffer(originalBuffer),
  };

  audioCache.set(sectionName, audioData);

  return audioData;
}


// Decode every section up front so a section change never
// stalls mid-scroll.
async function preload(sectionNames = sections.map((s) => s.name)) {
  for (const name of sectionNames) {
    await loadAudio(name);
  }
}


function createReversedBuffer(buffer) {
  const reversed = audioContext.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (
    let channel = 0;
    channel < buffer.numberOfChannels;
    channel++
  ) {
    const sourceData = buffer.getChannelData(channel);
    const targetData = reversed.getChannelData(channel);

    for (let i = 0; i < sourceData.length; i++) {
      targetData[i] = sourceData[sourceData.length - 1 - i];
    }
  }

  return reversed;
}


// --------------------------------------------------
// Playhead
// --------------------------------------------------

// Progress implied by the audio that is actually sounding
// right now, as opposed to the progress the scroll asked for.
function getPlayheadProgress() {
  if (!isPlaying || !source || !currentBuffer) {
    return progress;
  }

  const duration = currentBuffer.duration;

  if (!duration) return progress;

  const elapsed = audioContext.currentTime - sourceStartTime;
  const bufferTime = sourceStartOffset + elapsed;

  const played = clamp01(bufferTime / duration);

  return direction === -1 ? 1 - played : played;
}


// --------------------------------------------------
// Source control
// --------------------------------------------------

function stopSource(fadeOut = true) {
  const activeSource = source;
  const activeGain = gainNode;

  source = null;
  gainNode = null;
  isPlaying = false;

  if (!activeSource) return;

  activeSource.onended = null;

  const now = audioContext.currentTime;

  try {
    if (fadeOut && activeGain) {
      activeGain.gain.cancelScheduledValues(now);
      activeGain.gain.setValueAtTime(activeGain.gain.value, now);
      activeGain.gain.linearRampToValueAtTime(0, now + FADE);
      activeSource.stop(now + FADE);
    } else {
      activeSource.stop();
    }
  } catch {
    // already stopped
  }

  setTimeout(() => {
    try {
      activeSource.disconnect();
      activeGain?.disconnect();
    } catch {
      // already disconnected
    }
  }, FADE * 1000 + 50);
}


function startSource(nextDirection) {
  const buffer =
    nextDirection === -1 ? currentReversedBuffer : currentBuffer;

  if (!buffer) return;

  stopSource();

  const duration = buffer.duration;

  // Reversed audio counts from the other end.
  const rawOffset =
    nextDirection === -1
      ? (1 - progress) * duration
      : progress * duration;

  const offset = Math.max(0, Math.min(rawOffset, duration - 0.01));

  gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume,
    audioContext.currentTime + FADE
  );
  gainNode.connect(audioContext.destination);

  source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(gainNode);

  const startedSource = source;

  source.onended = () => {
    // Ignore the callback from a source we already replaced.
    if (startedSource !== source) return;

    source = null;
    gainNode = null;
    isPlaying = false;

    // Ran off the end of the clip.
    progress = direction === -1 ? 0 : 1;
    direction = 0;
  };

  source.start(0, offset);

  sourceStartTime = audioContext.currentTime;
  sourceStartOffset = offset;

  direction = nextDirection;
  isPlaying = true;
}


// --------------------------------------------------
// Section
// --------------------------------------------------

async function setSection(sectionName, initialProgress = 0) {
  if (currentSection === sectionName && currentBuffer) {
    progress = clamp01(initialProgress);
    return;
  }

  stopSource();

  const audioData = await loadAudio(sectionName);

  currentSection = sectionName;
  currentAudioPath = audioData.audioPath;
  currentBuffer = audioData.originalBuffer;
  currentReversedBuffer = audioData.reversedBuffer;

  progress = clamp01(initialProgress);
  direction = 0;
  isPlaying = false;
}


// --------------------------------------------------
// Transport
// --------------------------------------------------

async function play() {
  if (!currentBuffer) return;

  await resume();

  startSource(direction === -1 ? -1 : 1);
}


function pause() {
  // Freeze at the scroll position, not the playhead, so the
  // frame and the audio agree once scrolling stops.
  stopSource();

  direction = 0;
}


async function forward(amount = 0.01) {
  await setProgress(progress + amount, 1);
}


async function backward(amount = 0.01) {
  await setProgress(progress - amount, -1);
}


// --------------------------------------------------
// Set progress
//
// Called on every scroll frame. It only touches the source
// when it has to: on a direction change, on a stopped source,
// or when playback has drifted away from the scroll position.
// --------------------------------------------------

async function setProgress(value, hintDirection = 0) {
  if (!currentBuffer) return;

  const nextProgress = clamp01(value);
  const delta = nextProgress - progress;

  let nextDirection = 0;

  if (delta > EPSILON) {
    nextDirection = 1;
  } else if (delta < -EPSILON) {
    nextDirection = -1;
  } else {
    // No movement this frame. At a section boundary the local
    // progress can sit still while the scroll is clearly going
    // somewhere, so fall back to the caller's hint.
    nextDirection = hintDirection;
  }

  progress = nextProgress;

  if (!nextDirection) return;

  // Nothing left to play in that direction.
  if (
    (nextDirection === 1 && progress >= 1) ||
    (nextDirection === -1 && progress <= 0)
  ) {
    stopSource();
    direction = nextDirection;
    return;
  }

  await resume();

  if (!isPlaying || nextDirection !== direction) {
    startSource(nextDirection);
    return;
  }

  const drift =
    Math.abs(getPlayheadProgress() - progress) *
    currentBuffer.duration;

  if (drift > RESYNC_THRESHOLD) {
    startSource(nextDirection);
  }
}


// --------------------------------------------------
// Context
// --------------------------------------------------

async function resume() {
  if (!audioContext) return;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}


function setVolume(value) {
  volume = clamp01(value);

  if (gainNode) {
    gainNode.gain.setTargetAtTime(
      volume,
      audioContext.currentTime,
      0.01
    );
  }
}


// --------------------------------------------------
// Getters
// --------------------------------------------------

function getProgress() {
  return progress;
}


function getDirection() {
  return direction;
}


function getState() {
  return {
    section: currentSection,
    audioPath: currentAudioPath,
    progress,
    playhead: getPlayheadProgress(),
    direction,
    isPlaying,
    duration: currentBuffer?.duration || 0,
    contextState: audioContext?.state || "closed",
  };
}


// --------------------------------------------------
// Destroy
// --------------------------------------------------

function destroy() {
  stopSource(false);

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  audioCache.clear();
  sections = [];

  currentSection = null;
  currentAudioPath = null;
  currentBuffer = null;
  currentReversedBuffer = null;

  progress = 0;
  direction = 0;
  isPlaying = false;
}
