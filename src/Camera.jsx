import { useEffect, useRef, useState } from "react";

export default function Camera({ className = "" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState("");
  const [needsResume, setNeedsResume] = useState(false);

  async function startCamera() {
    setErr("");
    setNeedsResume(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const v = videoRef.current;
      if (!v) return;

      v.setAttribute("playsinline", "true");          // iOS Safari
      v.setAttribute("webkit-playsinline", "true");   // legacy iOS
      v.muted = true;                                 // autoplay hint
      v.srcObject = stream;

      await new Promise((res) => {
        if (v.readyState >= 1) res();
        else v.onloadedmetadata = () => res();
      });

      try {
        await v.play();
      } catch (playErr) {
        // Lost user gesture? show resume button
        setNeedsResume(true);
      }
    } catch (e) {
      console.error(e);
      setErr("Camera permission denied or unavailable.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await startCamera();
    })();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && videoRef.current && streamRef.current) {
        videoRef.current.play().catch(() => setNeedsResume(true));
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-zinc-900 bg-black ${className}`}>
      {err ? (
        <div className="p-4 text-sm text-red-400">{err}</div>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover aspect-[3/4]"
          />
          {needsResume && (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <button
                onClick={async () => {
                  try {
                    await videoRef.current?.play();
                    setNeedsResume(false);
                  } catch {
                    // As a last resort: re-request the stream
                    await startCamera();
                  }
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
