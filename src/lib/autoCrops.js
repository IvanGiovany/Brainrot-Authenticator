// src/lib/autoCrops.js
import { getImageLandmarker } from "./face";

// landmark indices
const LM = {
  L_EYE_T: 159, L_EYE_B: 145, L_EYE_L: 33,  L_EYE_R: 133,
  R_EYE_T: 386, R_EYE_B: 374, R_EYE_L: 362, R_EYE_R: 263,
  MOUTH_L: 61,  MOUTH_R: 291, LIP_TOP: 13, LIP_BOT: 14,
};

export async function autoCropsForImage(imgEl) {
  const lm = await getImageLandmarker();
  const res = lm.detect(imgEl);
  const pts = res?.faceLandmarks?.[0];
  if (!pts) return null;

  const W = imgEl.naturalWidth || imgEl.width;
  const H = imgEl.naturalHeight || imgEl.height;

  const box = (xs, ys, pad=1.8) => {
    const minX = Math.min(...xs) * W, maxX = Math.max(...xs) * W;
    const minY = Math.min(...ys) * H, maxY = Math.max(...ys) * H;
    const w = maxX - minX, h = maxY - minY;
    const cx = (minX + maxX)/2, cy = (minY + maxY)/2;
    const nw = w*pad, nh = h*pad;
    return [ (cx-nw/2)/W, (cy-nh/2)/H, nw/W, nh/H ]; // return RELATIVE box [0..1]
  };

  const leftEye  = box([pts[LM.L_EYE_L].x, pts[LM.L_EYE_R].x], [pts[LM.L_EYE_T].y, pts[LM.L_EYE_B].y], 1.9);
  const rightEye = box([pts[LM.R_EYE_L].x, pts[LM.R_EYE_R].x], [pts[LM.R_EYE_T].y, pts[LM.R_EYE_B].y], 1.9);
  const mouth    = box([pts[LM.MOUTH_L].x, pts[LM.MOUTH_R].x], [pts[LM.LIP_TOP].y, pts[LM.LIP_BOT].y], 1.9);

  return { leftEye, rightEye, mouth };
}

// fallback defaults if landmarks fail (cartoons)
// tweak if needed; they’re just safe starting points
export const DEFAULT_FALLBACKS = {
  leftEye:  [0.38, 0.32, 0.12, 0.12],
  rightEye: [0.58, 0.32, 0.12, 0.12],
  mouth:    [0.46, 0.60, 0.22, 0.14],
};
