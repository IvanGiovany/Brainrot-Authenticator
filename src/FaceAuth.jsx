import { useEffect, useRef, useState } from "react";
import { getVideoLandmarker as getLandmarker, detect } from "./lib/face.js";
import { memeEmotionTargets } from "./data/emotions.js";

export default function FaceAuth({ template, onScore }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState("");
  const [needsResume, setNeedsResume] = useState(false);

  async function startCamera() {
    setErr(""); setNeedsResume(false);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    streamRef.current = stream;
    const v = videoRef.current;
    v.setAttribute("playsinline", "true");
    v.setAttribute("webkit-playsinline", "true");
    v.muted = true;
    v.srcObject = stream;
    await new Promise(res => (v.readyState >= 1 ? res() : (v.onloadedmetadata = res)));
    try { await v.play(); } catch { setNeedsResume(true); }
  }

  useEffect(() => {
    let stop = false, raf;

    (async () => {
      try { await startCamera(); } catch (e) { setErr("Camera unavailable."); return; }
      let lm;
      try { lm = await getLandmarker(); } catch { lm = null; }

      const v = videoRef.current, c = canvasRef.current, ctx = c.getContext("2d");

      const render = () => {
        if (stop) return;
        if (v.videoWidth && c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
        if (v.videoWidth) ctx.drawImage(v, 0, 0, c.width, c.height);

        if (lm && v.videoWidth) {
          let res;
          try { res = detect(lm, v); } catch { res = null; }

          const pts = res?.faceLandmarks?.[0] || null;
          const cats = res?.faceBlendshapes?.[0]?.categories || null;

          // draw landmarks (tiny)
          if (pts) {
            ctx.fillStyle = "#f0f";
            for (const p of pts) ctx.fillRect(p.x * c.width, p.y * c.height, 2, 2);
          }

          // emotion score every frame (with smoothing + gates)
          if (cats && template) {
            const em = emotionFromBlendshapes(cats);
            const spec = memeEmotionTargets[template.id];

            // 3a) gates: hard accept/reject conditions
            let gatedOut = false;
            if (spec?.gates) {
              const g = spec.gates;
              const fail =
                (g.sadnessMin   != null && em.sadness   < g.sadnessMin) ||
                (g.happinessMin != null && em.happiness < g.happinessMin) ||
                (g.happinessMax != null && em.happiness > g.happinessMax) ||
                (g.surpriseMin  != null && em.surprise  < g.surpriseMin) ||
                (g.angerMin     != null && em.anger     < g.angerMin) ||
                (g.smirkAsymMin != null && em.smirkAsym < g.smirkAsymMin);
              gatedOut = fail;
            }

            // 3b) weighted similarity
            const sim = scoreEmotionWeighted(em, spec?.target);

            // 3c) temporal smoothing (EMA)
            // (move these two lines above to component state if you want cross-frame persistence)
            if (!window.__emoEma) window.__emoEma = 0;
            const alpha = 0.15; // smoothing factor
            window.__emoEma = window.__emoEma * (1 - alpha) + sim * alpha;

            const emoScore = gatedOut ? 0 : window.__emoEma;

            // HUD (optional)
            const hud = `🙂 ${(em.happiness).toFixed(2)}  ☹️ ${(em.sadness).toFixed(2)}  😮 ${(em.surprise).toFixed(2)}  😠 ${(em.anger).toFixed(2)}  😏 ${(em.smirkAsym).toFixed(2)} | score ${(emoScore*100|0)}%`;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(8, 8, ctx.measureText ? (ctx.measureText(hud).width + 12) : 260, 22);
            ctx.fillStyle = "#fff";
            ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(hud, 14, 24);

            onScore?.(emoScore);

            // score bar
            ctx.fillStyle = "rgba(250, 0, 255, 0.25)";
            ctx.fillRect(0, c.height - 8, Math.max(0, Math.min(1, emoScore)) * c.width, 8);
          }
        }
        raf = requestAnimationFrame(render);
      };

      render();
    })();

    const onVis = () => {
      if (document.visibilityState === "visible" && videoRef.current) {
        videoRef.current.play().catch(() => setNeedsResume(true));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); };
  }, [onScore, template]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-black">
      {err ? (
        <div className="p-4 text-sm text-red-400">{err}</div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="w-full h-full object-cover aspect-[3/4]" />
          {needsResume && (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <button
                onClick={async () => {
                  try { await videoRef.current?.play(); setNeedsResume(false); }
                  catch { await startCamera(); }
                }}
                className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-white hover:bg-fuchsia-400"
              >
                Tap to enable camera
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- helpers: blendshapes → compact emotion vector → similarity ---
function emotionFromBlendshapes(cats) {
  const get = (name) => cats.find(c => c.categoryName === name)?.score ?? 0;

  // base channels (0..1)
  const smileL = get('mouthSmileLeft'),  smileR = get('mouthSmileRight');
  const frownL = get('mouthFrownLeft'),  frownR = get('mouthFrownRight');
  const jawOpen = get('jawOpen');
  const blinkL = get('eyeBlinkLeft'),    blinkR = get('eyeBlinkRight');
  const browInnerUp = get('browInnerUp');
  const browDown = (get('browDownLeft') + get('browDownRight')) / 2;
  const mouthPress = (get('mouthPressLeft') + get('mouthPressRight')) / 2;

  // derived
  const smile = (smileL + smileR) / 2;
  const frown = (frownL + frownR) / 2;
  const eyeWide = 1 - (blinkL + blinkR) / 2;        // proxy: wide eyes = not blinking
  const smirkAsym = Math.min(1, Math.abs(smileL - smileR) * 2); // asymmetry 0..1

  // composites (0..1), clamp for safety
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const happiness = clamp01(smile - 0.3*frown);
  const sadness   = clamp01(0.6*frown + 0.4*browInnerUp);
  const anger     = clamp01(0.6*browDown + 0.4*mouthPress);
  const surprise  = clamp01(0.7*jawOpen + 0.3*eyeWide);

  return { happiness, sadness, anger, surprise, eyeWide, smirkAsym, // exports
           // keep raw for debugging if you want:
           smile, frown, jawOpen, blink: 1-eyeWide, browInnerUp, browDown, mouthPress };
}

function scoreEmotionWeighted(em, targetSpec) {
  if (!targetSpec) return 0;
  let sumW = 0, dist = 0;
  for (const [k, spec] of Object.entries(targetSpec)) {
    const t = typeof spec === 'object' ? spec.target : spec;
    const w = typeof spec === 'object' ? (spec.w ?? 1) : 1;
    if (em[k] == null || t == null) continue;
    dist += w * Math.abs(em[k] - t);
    sumW += w;
  }
  return sumW ? 1 - (dist / sumW) : 0;
}
