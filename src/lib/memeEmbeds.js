// src/lib/memeEmbeds.js
import { loadEmbedder, embedCanvasRegion } from "./embeddings";
import { memes } from "../data/memes";
import { autoCropsForImage, DEFAULT_FALLBACKS } from "./autoCrops";

export async function buildMemeEmbeddings(onProgress) {
  const model = await loadEmbedder();
  const out = {};
  const total = memes.length;

  for (let i = 0; i < memes.length; i++) {
    const m = memes[i];

    const img = await loadImage(m.img);
    const { canvas, w, h } = drawToCanvas(img);

    let crops = m.crops;
    if (!crops) {
      const auto = await autoCropsForImage(img).catch(() => null);
      crops = auto || DEFAULT_FALLBACKS;
    }

    const px = {
      leftEye:  relToPx(crops.leftEye,  w, h),
      rightEye: relToPx(crops.rightEye, w, h),
      mouth:    relToPx(crops.mouth,    w, h),
    };

    const eLeft  = embedCanvasRegion(model, canvas, px.leftEye);
    const eRight = embedCanvasRegion(model, canvas, px.rightEye);
    const eMouth = embedCanvasRegion(model, canvas, px.mouth);

    out[m.id] = { eLeft, eRight, eMouth };

    // report progress (0..1)
    if (onProgress) onProgress((i + 1) / total);
    // let the UI update
    await new Promise(requestAnimationFrame);
  }
  return out;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
function drawToCanvas(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return { canvas, w: canvas.width, h: canvas.height };
}
function relToPx([x,y,w,h], W, H) {
  return [x*W, y*H, w*W, h*H];
}
