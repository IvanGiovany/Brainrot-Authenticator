// Minimal reusable features + scoring for meme templates

// MediaPipe landmark indices we need
const LM = {
  MOUTH_L: 61, MOUTH_R: 291, LIP_TOP: 13, LIP_BOT: 14,
  L_EYE_T: 159, L_EYE_B: 145, R_EYE_T: 386, R_EYE_B: 374,
  L_BROW: 105, R_BROW: 334, // top brow points
};

const d = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);

function faceWidth(p) {
  return d(p[LM.MOUTH_L], p[LM.MOUTH_R]) || 1;
}

// Extract a few normalized features (scale-invariant)
export function extractFeatures(p) {
  const fw = faceWidth(p);
  const mouthW   = d(p[LM.MOUTH_L], p[LM.MOUTH_R]) / fw;
  const mouthOpen= d(p[LM.LIP_TOP], p[LM.LIP_BOT]) / fw;
  const eyeOpenL = d(p[LM.L_EYE_T], p[LM.L_EYE_B]) / fw;
  const eyeOpenR = d(p[LM.R_EYE_T], p[LM.R_EYE_B]) / fw;

  // eyebrow "raise": eye top minus brow top (positive = brow higher)
  const browRaiseL = (p[LM.L_EYE_T].y - p[LM.L_BROW].y) / fw;
  const browRaiseR = (p[LM.R_EYE_T].y - p[LM.R_BROW].y) / fw;

  return { mouthW, mouthOpen, eyeOpenL, eyeOpenR, browRaiseL, browRaiseR };
}

// Rules look like: { key:'mouthOpen', op:'<=', target:0.06, weight:1 }
export function scoreAgainstTemplate(points, template) {
  if (!points) return 0;
  const f = extractFeatures(points);
  let s = 0, wSum = 0;
  for (const rule of (template.rules || [])) {
    const val = f[rule.key];
    if (val == null) continue;
    const w = rule.weight ?? 1;
    let ok = false;
    switch (rule.op) {
      case '>=': ok = val >= rule.target; break;
      case '<=': ok = val <= rule.target; break;
      case '≈':  ok = Math.abs(val - rule.target) <= (rule.tolerance ?? 0.05); break;
      default:   ok = false;
    }
    s += ok ? w : 0;
    wSum += w;
  }
  return wSum ? (s / wSum) : 0;
}
