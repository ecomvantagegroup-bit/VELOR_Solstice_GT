import gsap from "gsap";

const SEQUENCE_JSON_PATH = "/config/sequenceConfig.json";

export async function loadSequenceConfig() {
  const response = await fetch(SEQUENCE_JSON_PATH);

  if (!response.ok) {
    throw new Error(
      `Failed to load sequence JSON: ${SEQUENCE_JSON_PATH}`
    );
  }

  return response.json();
}

async function getSectionConfig(sectionName) {
  const config = await loadSequenceConfig();

  const section = config.sections?.find(
    (item) => item.name === sectionName
  );

  if (!section) {
    throw new Error(
      `Section "${sectionName}" not found in sequence JSON`
    );
  }

  return section;
}

async function loadImages(imagesConfig) {
  const {
    path,
    start,
    end,
    extension = ".webp",
    pad = 4
  } = imagesConfig;

  const imageUrls = [];

  for (let i = start; i <= end; i++) {
    const frameNumber = String(i).padStart(pad, "0");

    imageUrls.push(
      `${path}${frameNumber}${extension}`
    );
  }

  const images = await Promise.all(
    imageUrls.map(
      (url) =>
        new Promise((resolve, reject) => {
          const image = new Image();

          image.onload = () => resolve(image);

          image.onerror = () =>
            reject(
              new Error(
                `Failed to load image: ${url}`
              )
            );

          image.src = url;
        })
    )
  );

  return images;
}

export async function loadImageSequence(
  canvas,
  sectionName
) {
  if (!canvas) {
    throw new Error("Canvas element is required");
  }

  const section =
    await getSectionConfig(sectionName);

  const images =
    await loadImages(section.images);

  if (!images.length) {
    throw new Error(
      `No images found for "${sectionName}"`
    );
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Could not get canvas 2D context"
    );
  }

  const state = {
    frame: 0
  };

  function render(frameIndex) {
    const index = Math.max(
      0,
      Math.min(
        Math.round(frameIndex),
        images.length - 1
      )
    );

    const image = images[index];

    if (!image) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const imageRatio =
      image.width / image.height;

    const canvasRatio =
      width / height;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = width;
      drawHeight = drawWidth / imageRatio;
    }

    const x =
      (width - drawWidth) / 2;

    const y =
      (height - drawHeight) / 2;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    ctx.drawImage(
      image,
      x,
      y,
      drawWidth,
      drawHeight
    );
  }

  function resize() {
    const dpr =
      window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    render(state.frame);
  }

  resize();

  window.addEventListener(
    "resize",
    resize
  );

  const frameTween = gsap.to(state, {
    frame: images.length - 1,
    ease: "none",
    paused: true,

    onUpdate() {
      render(state.frame);
    }
  });

  render(0);

  return {
    section,
    images,
    totalFrames: images.length,

    setProgress(progress) {
      const value = Math.max(
        0,
        Math.min(progress, 1)
      );

      frameTween.progress(value);
    },

    render,

    getAudioPath() {
      return section.audio?.path ?? null;
    },

    destroy() {
      window.removeEventListener(
        "resize",
        resize
      );

      frameTween.kill();
    }
  };
}

